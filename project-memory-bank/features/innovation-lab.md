# Feature: Innovation Lab

**Status: Implemented (Phase 4).**

A workspace for challenging the status quo. Each **Experiment** is run through one of three lenses; the goal is to break a problem open and find the non-obvious move — not to grade the idea.

## Entity
`Experiment` (`src/domain/types.ts`) — one rich artifact, like `SystemMap`:
- Shared: `title`, `subject` (what's being reimagined), `technique` (active lens), `insight` (what shifted).
- Lens data (all persisted, never lost when toggling):
  - **Challenge assumptions** → `assumptionChallenges: { assumption, challenge }[]`.
  - **First principles** → `fundamentals: string[]` + `reconstruction`.
  - **Redesign** → `constraintsToDrop: string[]` + `reimagined`.

## Persistence
- `experiments` store (Dexie **v4**): `id, sessionId, updatedAt`. Existing v1–v3 data carries forward.
- Repository: `createExperiment(sessionId?)`, `saveExperiment`, `deleteExperiment`.

## UI
- `src/screens/InnovationLabScreen.tsx` (`/lab`) — master/detail list (mirrors Systems workspace).
- `src/screens/ExperimentEditor.tsx` — technique toggle + the focused lens section + inline `AssumptionChallengesEditor`. Edits persist immediately. Reuses `ui.tsx` (`Field`, `ListEditor`, `TextArea`, …).
- `CoachPanel` reused at the bottom (`kind: 'experiment'`).

## AI Coach
- `src/ai/prompts.ts` — `experimentUser()` builder; system prompt unchanged. The coach pushes past the status quo and asks where the thinking is still anchored — **never grades or scores**.
- `Coaching.targetKind` extended with `'experiment'`.

## Design rules honored
- **No numeric scores** anywhere.
- Technique toggle is **non-destructive** (no data loss on switch).
- Files kept <300 lines (strict modularity).

## Not yet (later)
- Seeding an experiment's `subject` from an existing Problem/Decision (cross-artifact linking — Phase 6).
- Streaming coach responses (v1 awaits full completion).
