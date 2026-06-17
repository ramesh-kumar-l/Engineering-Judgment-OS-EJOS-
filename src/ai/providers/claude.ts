import type { LLMProvider, ChatMessage } from '../types';
import { splitSystem } from '../types';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

// Anthropic Messages API, called directly from the browser. The
// 'anthropic-dangerous-direct-browser-access' header enables CORS; note this
// means the key is used client-side (acceptable for a single-device app — AD-004).
export function createClaudeProvider(apiKey: string, model: string): LLMProvider {
  async function call(messages: ChatMessage[], maxTokens: number, signal?: AbortSignal) {
    if (!apiKey) throw new Error('No Claude API key set. Add one in Settings.');
    const { system, turns } = splitSystem(messages);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: turns }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Claude API error ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const out = data?.content?.[0]?.text;
    if (typeof out !== 'string') throw new Error('Claude returned an unexpected response shape.');
    return out;
  }

  return {
    id: 'claude',
    model,
    complete: (messages, signal) => call(messages, 1024, signal),
    check: async () => {
      await call([{ role: 'user', content: 'Reply with OK.' }], 8);
    },
  };
}
