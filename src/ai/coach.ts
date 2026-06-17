import type { AISettings } from './types';
import { getProvider } from './providers';
import { buildCoachingMessages, type CoachTarget } from './prompts';

// High-level entry the UI uses. Selects the configured provider, builds the
// coaching prompt for the artifact, and returns the coach's response text.
export async function runCoaching(
  settings: AISettings,
  target: CoachTarget,
  signal?: AbortSignal,
): Promise<string> {
  const provider = getProvider(settings);
  const messages = buildCoachingMessages(target);
  return provider.complete(messages, signal);
}
