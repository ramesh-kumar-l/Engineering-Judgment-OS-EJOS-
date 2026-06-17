# Feature: AI Coach

**Status: Implemented (Phase 3).**

The coach sharpens the engineer's own thinking on any artifact — it **asks questions and surfaces blind spots, and never grades or scores** (rule lives in the system prompt).

## Pluggable LLM layer (AD-004)
Single interface, swappable backends (`src/ai/`):
- `types.ts` — `LLMProvider`, `ChatMessage`, `AISettings`, defaults.
- `providers/claude.ts` — Anthropic Messages API (browser-direct; needs `anthropic-dangerous-direct-browser-access`).
- `providers/gemini.ts` — Google Generative Language API.
- `providers/ollama.ts` — **local** `/api/chat` (works offline; needs `OLLAMA_ORIGINS`).
- `providers/index.ts` — `getProvider(settings)` factory.
- `prompts.ts` — coaching system prompt + per-artifact prompt builders (`problem | decision | systemMap`).
- `coach.ts` — `runCoaching(settings, target)`.

## UI
- `src/components/CoachPanel.tsx` — reusable; dropped at the bottom of each editor (Problem, Decision, System Map). "Get coaching" → calls the active provider → persists result.
- `src/screens/SettingsScreen.tsx` (`/settings`) — pick provider, enter keys/models/Ollama URL, **Test connection**.

## Persistence
- `coachings` store (Dexie v3): one row per artifact id = latest coaching (survives reload/offline).
- `settings` store (Dexie v3): single `id='ai'` row, local only.

## Provider matrix
| Provider | Network | Needs | Notes |
|----------|---------|-------|-------|
| Claude | online | API key | key used client-side (R-002) |
| Gemini | online | API key | key used client-side (R-002) |
| Ollama | **offline** | local server + model | set `OLLAMA_ORIGINS` (R-003); `ollama pull qwen3` |

## Not yet (later)
- Streaming responses (currently awaits full completion — simpler/stable).
- Cross-artifact insight synthesis (Phase 5).
- Request queue for online providers when offline (deferred; Ollama covers offline AI).
