# Feature: Daily Thinking Session (Workout)

**Status: Implemented (Phase 1).** `src/screens/SessionScreen.tsx`

The center of the experience and the app's home route (`/`). On open it shows the date and the prompt **"What problem are you thinking about today?"** — no dashboards or analytics first (06-design-system.md).

- One `Session` per calendar day (`getOrCreateTodaySession`).
- The problem statement auto-saves locally (debounced) — works fully offline.
- Two next actions: "Frame this problem →" (Problem Framing) and "Record a decision" (Decision Journal).
