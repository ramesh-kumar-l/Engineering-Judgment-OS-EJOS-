# Current State

> Always read this file first. Update it after every meaningful change.
> (This is the project's "active-context" / save-state file.)

## Current Phase
Phase 6 — Cognitive Repository — **COMPLETE**. All planned phases (0–6) implemented.

## Current Sprint
None active. v1 feature roadmap complete; awaiting founder smoke-test + direction (hardening, tests, icons, or commit).

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
- **Phase 4 — Innovation Lab:**
  - `Experiment` entity + Dexie **v4** store (`experiments`).
  - Innovation Lab (`/lab`) — master/detail over experiments (mirrors Systems workspace).
  - Three lenses via a non-destructive technique toggle: **Challenge assumptions** (assumption/challenge pairs), **First principles** (fundamental truths → reconstruction), **Redesign** (constraints to drop → reimagined). Shared Subject + Insight fields.
  - `CoachPanel` reused (coach `targetKind` extended to `experiment`) — coach pushes past the status quo, never grades.
- **Phase 5 — Weekly Review:**
  - `Review` entity + Dexie **v5** store (`reviews`, one row per week, lazily created).
  - Weekly Review (`/review`) — week stepper, locally-computed patterns, reflection editor.
  - Pattern detection (`src/review/patterns.ts`, pure/offline, **no scores**): per-type counts vs prior week, confidence mix, recurring themes, `ReviewPattern[]` (volume trend, open prediction loops, confidence skew, single-lens, recurring threads, quiet week).
  - `PatternList` presentational view; `CoachPanel` reused (`targetKind` → `review`) over a `summaryText` digest — spots cross-week patterns, never grades.
- **Phase 6 — Cognitive Repository:**
  - `Connection` entity + `ArtifactKind` + Dexie **v6** store (`connections`); repository `createConnection`/`deleteConnection`.
  - Pure normalization/search (`src/cognitive/artifacts.ts`, **no scores**): `collectArtifacts` → uniform `ArtifactRef[]`, `searchArtifacts` (offline AND-match), `indexByKey`/`refKey`.
  - Cognitive Repository (`/repository`): full-text search across all artifacts, read-only thinking graph (SVG ring, color-per-kind, undirected edges), manual connections editor.
  - `SearchResults` / `ThinkingGraph` / `ConnectionsEditor` presentational pieces (each <300 lines).

## In Progress Features
- (none)

## Pending Features
- (none) — v1 roadmap (Phases 0–6) complete. See `10-phase-roadmap.md`.

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
Founder smoke-test (`npm run dev`): open **Cognitive Repository** → search a term → confirm hits across artifact types → **Connect** two artifacts → confirm they appear in the thinking graph → delete a connection. Then decide v1 hardening direction: automated tests, PWA icons, or **commit Phases 0–6 to git** (nothing committed since initial commit).

## Last Updated
2026-06-17 (Phase 6)
