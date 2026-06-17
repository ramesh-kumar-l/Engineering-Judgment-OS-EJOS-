import type { AISettings, LLMProvider } from '../types';
import { createClaudeProvider } from './claude';
import { createGeminiProvider } from './gemini';
import { createOllamaProvider } from './ollama';

// Factory: build the active provider from settings. The rest of the app depends
// only on the LLMProvider interface, never on a concrete provider (AD-004).
export function getProvider(s: AISettings): LLMProvider {
  switch (s.provider) {
    case 'claude':
      return createClaudeProvider(s.claudeApiKey, s.claudeModel);
    case 'gemini':
      return createGeminiProvider(s.geminiApiKey, s.geminiModel);
    case 'ollama':
      return createOllamaProvider(s.ollamaBaseUrl, s.ollamaModel);
  }
}

export { createClaudeProvider, createGeminiProvider, createOllamaProvider };
