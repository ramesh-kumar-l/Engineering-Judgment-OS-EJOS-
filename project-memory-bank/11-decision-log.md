# Decision Log

> Append-only record of significant decisions. Newest first.

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
