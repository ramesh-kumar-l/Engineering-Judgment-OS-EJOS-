// Pluggable LLM layer (AD-004). Online providers (Claude/Gemini) need a key;
// the Ollama provider runs against a local server and works fully OFFLINE.

export type ProviderId = 'claude' | 'gemini' | 'ollama';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** A uniform interface every provider implements. */
export interface LLMProvider {
  id: ProviderId;
  model: string;
  /** Full text completion. Throws a human-readable Error on failure. */
  complete(messages: ChatMessage[], signal?: AbortSignal): Promise<string>;
  /** Cheap reachability + credential check. Throws on failure. */
  check(): Promise<void>;
}

/** Persisted AI configuration (single row, id='ai'). Stored locally on device. */
export interface AISettings {
  id: 'ai';
  provider: ProviderId;
  claudeApiKey: string;
  claudeModel: string;
  geminiApiKey: string;
  geminiModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
  updatedAt: number;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  id: 'ai',
  provider: 'claude',
  claudeApiKey: '',
  claudeModel: 'claude-sonnet-4-6',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'qwen3',
  updatedAt: 0,
};

/** Split a message list into a single system string + the conversation turns. */
export function splitSystem(messages: ChatMessage[]): {
  system: string;
  turns: { role: 'user' | 'assistant'; content: string }[];
} {
  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');
  const turns = messages
    .filter((m): m is { role: 'user' | 'assistant'; content: string } => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));
  return { system, turns };
}
