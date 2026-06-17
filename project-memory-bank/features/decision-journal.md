# Feature: Decision Journal

**Status: Implemented (Phase 1).** `src/screens/DecisionJournalScreen.tsx`

Master/detail Decision Records. Fields: title, context, options considered, chosen option, reasoning (tradeoffs), **confidence (low/medium/high — no numeric scores)**, expected outcome, and an outcome-review block (actual outcome + open/reviewed status).

All edits persist immediately (`saveDecision`). List shows a status dot (reviewed vs open).

## Not yet (later)
- Review reminders / surfacing decisions due for review; AI tradeoff coaching (Phase 3); confidence-vs-outcome patterns (Phase 5).
