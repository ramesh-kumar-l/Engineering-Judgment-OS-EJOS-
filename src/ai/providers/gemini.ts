import type { LLMProvider, ChatMessage } from '../types';
import { splitSystem } from '../types';

// Google Generative Language API (Gemini). Supports browser CORS with an API key.
export function createGeminiProvider(apiKey: string, model: string): LLMProvider {
  async function call(messages: ChatMessage[], signal?: AbortSignal) {
    if (!apiKey) throw new Error('No Gemini API key set. Add one in Settings.');
    const { system, turns } = splitSystem(messages);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents: turns.map((t) => ({
        role: t.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: t.content }],
      })),
    };
    const res = await fetch(url, {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof out !== 'string') throw new Error('Gemini returned an unexpected response shape.');
    return out;
  }

  return {
    id: 'gemini',
    model,
    complete: (messages, signal) => call(messages, signal),
    check: async () => {
      await call([{ role: 'user', content: 'Reply with OK.' }]);
    },
  };
}
