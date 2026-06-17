# Decision Log

> Append-only record of significant decisions. Newest first.

## AD-004 — Pluggable LLM provider layer (online + offline AI)
- **Date:** 2026-06-17
- **Status:** Accepted
- **Decision:** The AI Coach runs through a single `LLMProvider` interface with swappable backends:
  - **Online:** **Claude** (Anthropic) or **Gemini** (Google), via an API key the user supplies.
  - **Offline:** **Ollama** local server (e.g. `qwen3`, `gemma3`) — runs on the user's machine, no network.
  - The app depends only on the interface (`src/ai/types.ts`); concrete providers live in `src/ai/providers/`. Active provider + keys + models are chosen in Settings and stored locally (Dexie `settings`, single row).
- **Why:** Honors offline-first (AD-001) for AI too — Ollama makes the coach usable with no internet. Gives the founder choice/cost control and avoids lock-in to one vendor.
- **Consequences / tradeoffs (flagged):**
  - **Revises AD-001's "AI is online-only":** AI is now *offline-capable* via Ollama. R-001 downgraded to **Mitigated**.
  - **Client-side keys (R-002):** Claude/Gemini are called directly from the browser; the key is used client-side. Anthropic needs the `anthropic-dangerous-direct-browser-access` header. Acceptable for a single-device local-first app; revisit if sync/multi-user is added.
  - **Ollama CORS (R-003):** the browser can only reach Ollama if it's started with `OLLAMA_ORIGINS` allowing the app origin (e.g. `OLLAMA_ORIGINS=*`). Surfaced in Settings + `Test connection`.
  - Coach **never grades or scores** — it asks questions and surfaces blind spots (design rule preserved in the system prompt).
- **Detail:** `04-system-architecture.md` (AI adapter), `features/ai-coach.md`.

## AD-003 — "Authentication" deferred (no cloud accounts in v1)
- **Date:** 2026-06-16
- **Status:** Accepted (reversible)
- **Decision:** Phase 1 ships with **no authentication and no accounts.** This follows directly from AD-001: the app is single-device and local-first, so cloud auth would contradict offline-first and add friction for zero v1 benefit. An *optional local app lock (passcode)* may be added later; it is off by default and not required for use.
- **Why this differs from the system prompt:** the master prompt lists "Authentication" as a Phase 1 deliverable, but that assumes a server/multi-user model. Flagged to founder; revisit if cloud sync/accounts are ever wanted.


## AD-001 — Offline-first architecture
- **Date:** 2026-06-16
- **Decided by:** Founder
- **Decision:** The product must work fully offline. Thinking data (problems, decisions, system maps, reviews) is stored locally on the device and is the source of truth. Any cloud sync is additive and optional, never required for daily use.
- **Consequences:**
  - Local-first data store required (e.g. IndexedDB / SQLite-class).
  - App shell must load and function with no network.
  - The AI Coach (LLM-backed) requires connectivity → must degrade gracefully: queue requests, allow full manual workflows without AI, never block core use on AI.
  - Influences packaging choice (PWA vs desktop) — see AD-002.
- **Status:** Accepted

## AD-002 — Technology stack
- **Date:** 2026-06-16
- **Status:** **Accepted** (reversible)
- **Decision:** Local-first **PWA** — TypeScript + Vite + React (SPA), Tailwind CSS, Zustand, Dexie/IndexedDB as on-device source of truth, Service Worker for offline shell. AI Coach via Claude API (online-only, additive). Optional Tauri desktop wrapper later (same codebase).
- **Rationale:** Satisfies AD-001 natively, lowest build/deploy friction, cross-device, premium SPA feel, no backend needed on day one.
- **Reversibility:** If true offline AI is later required, revisit with a small local model. Out of scope now.
- **Detail:** see `04-system-architecture.md`.
