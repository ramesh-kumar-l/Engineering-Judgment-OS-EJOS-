# Current State

> Always read this file first. Update it after every meaningful change.
> (This is the project's "active-context" / save-state file.)

## Current Phase
Phase 3 — AI Coach — **COMPLETE** (awaiting approval to start Phase 4)

## Current Sprint
None active. Next: Phase 4 — Innovation Lab (pending approval).

## Completed Features
- **Phase 0:** Vision (`01`), Personas (`02`), Architecture (`04`), Design System (`06`).
- **Phase 1:**
  - PWA scaffold (Vite + React 19 + TS + Tailwind v4 + Dexie + Service Worker). Builds clean; offline shell precached.
  - Local data layer (`src/db`) — IndexedDB source of truth.
  - Today's Thinking Session (home, auto-save).
  - Problem Framing workspace (assumptions, stakeholders, root-cause).
  - Decision Journal (reasoning, confidence, expected/actual outcome, review status).
  - App shell + routing + offline indicator.
- **Phase 2 — Systems Thinking:**
  - `SystemMap` entity + Dexie v2 store (`systemMaps`).
  - Systems Workspace (`/systems`) — master/detail over system maps.
  - System Maps: parts (nodes), directed causal connections with polarity (reinforcing/balancing — **no numeric weights**), feedback loops, leverage points.
  - Live read-only SVG diagram (`SystemMapDiagram`) — ring layout, colored directed edges. No drag-drop (stable, deterministic).
  - Reflection block (what the map revealed; second-order effects).
- **Phase 3 — AI Coach:**
  - Pluggable LLM layer (`src/ai/`): online **Claude**/**Gemini** (API key) + offline **Ollama** (local model). App depends only on the `LLMProvider` interface.
  - Coaching prompts that surface blind spots and ask questions — **never grade/score**.
  - `CoachPanel` on every editor (Problem / Decision / System Map); persists latest coaching per artifact.
  - Settings screen (`/settings`): provider picker, keys/models, Ollama URL, Test connection.
  - Dexie **v3**: `settings` + `coachings` stores.

## In Progress Features
- (none)

## Pending Features
- Phase 4: Innovation Lab (assumption challenges, redesign, first-principles).
- Phase 5+: see `10-phase-roadmap.md`

## Architecture Decisions
| ID | Decision | Status |
|----|----------|--------|
| AD-001 | Offline-first; local store = source of truth; AI Coach additive | Accepted |
| AD-002 | Stack: local-first PWA (TS + Vite + React + Tailwind + Zustand + Dexie/IndexedDB + SW) | Accepted (reversible) |
| AD-003 | No authentication/accounts in v1 (single-device, local-first); optional local lock later | Accepted (reversible) |
| AD-004 | Pluggable LLM: Claude/Gemini (online) + Ollama (offline). App depends only on the provider interface | Accepted |

## Known Risks
- R-001: AI offline — **Mitigated** by the Ollama provider.
- R-002: Claude/Gemini keys used client-side — Accepted (single-device, local-first).
- R-003: Ollama browser CORS needs `OLLAMA_ORIGINS` — Open (documented; Test connection surfaces it).

## Known Bugs
- (none observed; not yet exercised in a real browser end-to-end by the founder)

## Technical Debt
- No automated tests yet (manual build + serve validation only).
- No app icons in PWA manifest (icons array empty) — cosmetic; add before any install/distribution.
- Zustand installed but not yet used (reserved for cross-screen UI state).
- System map diagram is read-only (auto-layout); no manual node positioning — intentional for v1 stability.
- AI Coach responses are not streamed (awaits full completion) — simpler/stable for v1.

## Next Recommended Task
Founder smoke-test (`npm run dev`): open **Settings**, pick a provider (paste a Claude/Gemini key, or run Ollama with `OLLAMA_ORIGINS=*` + `ollama pull qwen3`), **Test connection**, then open any artifact and click **Get coaching**. On approval, begin **Phase 4 — Innovation Lab**.

## Last Updated
2026-06-17 (Phase 3)
