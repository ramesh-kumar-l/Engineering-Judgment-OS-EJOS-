# Current State

> Always read this file first. Update it after every meaningful change.
> (This is the project's "active-context" / save-state file.)

## Current Phase
Phase 6 — Cognitive Repository — **COMPLETE**. All planned phases (0–6) implemented.

## Current Sprint
None active. v1 feature roadmap complete + hardening pass + Golden Examples (seeded demo data) + onboarding/blog docs done. Awaiting founder smoke-test + direction (commit to git, or further hardening).

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
- **Golden Examples (post-roadmap, 2026-06-18):**
  - Seeded demo data module (`src/db/seed.ts` + `seedData.ejos.ts` + `seedData.fitness.ts`) — part of the persistence layer; `seedGoldenExamples`/`removeGoldenExamples`/`hasGoldenExamples`.
  - Two complete worked examples ("Using EJOS on itself"; "Android Fitness Tracker") spanning all 6 artifact types + connections, dated into past weeks (`2026-06-08`, `2026-06-01`) so the Weekly Review shows real patterns (incl. an intentional open prediction loop).
  - **Idempotent** (deterministic `ex-…` ids → `bulkPut` no-dupes), **labeled** (`[Example]` title prefix), **removable** (`bulkDelete` touches only seeded rows). No Dexie schema change — reuses v6 stores.
  - UI: "Example data" section in `SettingsScreen` (Load / Remove buttons). Build: 61 modules; 15 tests still green.
- **Onboarding & content docs (2026-06-18, non-code):** `Quick_Starter_Guide.md` (root); `blogs/` 5-post build series + index; `blogs/case-studies/` 3-post series grounded in the golden examples.

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
- **Resolved (hardening pass 2026-06-17):**
  - Automated tests added — Vitest suite over the pure cores (`artifacts.test.ts`, `patterns.test.ts`), 15 tests; `npm test` green. Test files excluded from `tsc -b` build.
  - Top-level `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) wraps the router — a screen crash now shows recovery UI instead of white-screening the offline app.
  - PWA icon added (`public/icon.svg`, scalable SVG) — manifest `icons` no longer empty; installable.
- Remaining:
  - Test coverage is on pure logic only; UI components / repository (Dexie) paths are not yet tested.
  - Zustand installed but not yet used (reserved for cross-screen UI state).
  - System map diagram is read-only (auto-layout); no manual node positioning — intentional for v1 stability.
  - AI Coach responses are not streamed (awaits full completion) — simpler/stable for v1.
  - Single SVG PWA icon (no dedicated 192/512 PNG or maskable variant) — sufficient for v1 install.

## Next Recommended Task
Founder smoke-test (`npm run dev`): **Settings → Load golden examples** → confirm both examples populate across Problem Framing / Systems / Decisions / Innovation Lab → open **Weekly Review** and step back to the weeks of Jun 1 & Jun 8 (confirm detected patterns + the open prediction loop) → open **Cognitive Repository**, search a term, confirm cross-type hits and the thinking graph edges → **Remove example data** → confirm only seeded rows are gone. Then **commit Phases 0–6 + hardening + golden examples + docs to git** (nothing committed since initial commit `7442b5a`). Optional further hardening: tests for repository/Dexie/seed paths, dedicated PNG/maskable icons.

## Last Updated
2026-06-18 (Golden Examples seed feature + onboarding guide + blog series)
