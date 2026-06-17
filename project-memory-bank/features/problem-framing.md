# Feature: Problem Framing

**Status: Implemented (Phase 1).** `src/screens/ProblemFramingScreen.tsx`

Master/detail workspace. Outputs captured per problem:
- Title + problem statement
- **Assumptions** (list) — "each one is a risk"
- **Stakeholders** (list) — who's affected / whose incentives matter
- **Root-cause notes** — keep asking why

All edits persist to IndexedDB immediately (`saveProblem`). Reactive list via `useLiveQuery`.

## Not yet (later)
- Visual problem tree, AI coaching on the framing (Phase 3).
