import type { LLMProvider, ChatMessage } from '../types';

// Local LLM via Ollama (e.g. gemma3, qwen3). Runs on the user's machine, so the
// AI Coach works OFFLINE (AD-004 / mitigates R-001).
// Note: Ollama must allow the app origin via CORS — start it with
// `OLLAMA_ORIGINS=*` (see Settings hint).
export function createOllamaProvider(baseUrl: string, model: string): LLMProvider {
  const base = baseUrl.replace(/\/+$/, '');

  async function chat(messages: ChatMessage[], signal?: AbortSignal) {
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    }).catch(() => {
      throw new Error(`Can't reach Ollama at ${base}. Is it running? (ollama serve)`);
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama error ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const out = data?.message?.content;
    if (typeof out !== 'string') throw new Error('Ollama returned an unexpected response shape.');
    return out;
  }

  return {
    id: 'ollama',
    model,
    complete: (messages, signal) => chat(messages, signal),
    check: async () => {
      const res = await fetch(`${base}/api/tags`).catch(() => {
        throw new Error(`Can't reach Ollama at ${base}. Is it running? (ollama serve)`);
      });
      if (!res.ok) throw new Error(`Ollama not reachable at ${base} (status ${res.status}).`);
    },
  };
}
