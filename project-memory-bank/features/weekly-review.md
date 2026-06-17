# Feature: Weekly Review

**Status: Implemented (Phase 5).**

A step-back ritual. Once a week the founder looks across everything they captured, sees patterns surfaced **locally** (offline, deterministic), writes a short reflection, and optionally asks the coach to push on it. The point is to learn — **never to score**.

## Pattern detection (`src/review/patterns.ts`, pure / no I/O)
Runs fully offline over all artifacts, filtered to a **Monday-anchored week**, compared against the prior week (growth/trend).
- `weekRangeFor(offset)` — offset 0 = this week, -1 = last week; `previousRange`, `rangeLabel`.
- `computeInsights(artifacts, range): ReviewInsights` — per-type counts + prior-week counts, decision confidence mix (low/med/high — descriptive, **no score**), recurring themes (words across ≥2 artifacts, stopword-filtered), and a list of `ReviewPattern`s.
- Detected patterns (each an observation + a question): thinking volume vs. last week, **predictions still open** (decisions with an expected but no actual outcome — across all time), confidence skew (high or low), single-lens experimentation, recurring threads, quiet week.
- `summaryText(insights)` — plain-text digest handed to the coach.

## Persistence
- `Review` entity (`src/domain/types.ts`): `{ id = rangeStart, rangeStart, rangeEnd, notes, insight, … }` — **one row per week**.
- `reviews` store (Dexie **v5**): `id, rangeStart, updatedAt`. Existing v1–v4 data carries forward.
- Repository: `saveReview` (upsert). Created **lazily on first edit** — browsing weeks writes nothing.
- Patterns are **recomputed live**, not stored; the founder's `notes`/`insight` are the durable growth record.

## UI
- `src/screens/WeeklyReviewScreen.tsx` (`/review`) — week stepper (Prev/Next, Next disabled at current week), live artifacts via `useLiveQuery`, computed insights, reflection fields, coach.
- `src/review/PatternList.tsx` — presentational count tiles + pattern cards (tone = color cue only, not a ranking) + recurring-theme chips.
- `CoachPanel` reused (`kind: 'review'`), keyed by week start so coaching persists per week.

## AI Coach
- `src/ai/prompts.ts` — `ReviewDigest` type + `reviewUser()` builder; coach helps spot cross-week patterns and asks what to change — **never grades**. `Coaching.targetKind` extended with `'review'`.

## Design rules honored
- **No numeric scores** anywhere (counts and confidence mix are descriptive).
- Detection is **offline-first** and deterministic; the coach is purely additive.
- Files kept <300 lines (strict modularity): `patterns.ts`, `PatternList.tsx`, `WeeklyReviewScreen.tsx` each well under.

## Not yet (later)
- Cross-week trend visualization / streaks (kept descriptive for v1 stability).
- Clicking a pattern to jump to the underlying artifact (cross-artifact linking — Phase 6).
