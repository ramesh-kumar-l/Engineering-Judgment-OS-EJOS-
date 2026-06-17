# Current State

> Always read this file first. Update it after every meaningful change.
> (This is the project's "active-context" / save-state file.)

## Current Phase
Phase 2 — Systems Thinking — **COMPLETE** (awaiting approval to start Phase 3)

## Current Sprint
None active. Next: Phase 3 — AI Coach (pending approval).

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

## In Progress Features
- (none)

## Pending Features
- Phase 3: AI Coach (Feedback Engine, Coaching Layer, Insight Generation) — online-only, additive.
- Phase 4+: see `10-phase-roadmap.md`

## Architecture Decisions
| ID | Decision | Status |
|----|----------|--------|
| AD-001 | Offline-first; local store = source of truth; AI Coach additive/online-only | Accepted |
| AD-002 | Stack: local-first PWA (TS + Vite + React + Tailwind + Zustand + Dexie/IndexedDB + SW); Claude API for AI | Accepted (reversible) |
| AD-003 | No authentication/accounts in v1 (single-device, local-first); optional local lock later | Accepted (reversible) |

## Known Risks
- R-001: AI Coach can't run offline (mitigated by design; validated in Phase 3).

## Known Bugs
- (none observed; not yet exercised in a real browser end-to-end by the founder)

## Technical Debt
- No automated tests yet (manual build + serve validation only).
- No app icons in PWA manifest (icons array empty) — cosmetic; add before any install/distribution.
- Zustand installed but not yet used (reserved for cross-screen UI state).
- System map diagram is read-only (auto-layout); no manual node positioning — intentional for v1 stability.

## Next Recommended Task
Founder smoke-test in a browser (`npm run dev`): build a system map (add parts, connect them, watch the diagram update), then reload to confirm persistence. On approval, begin **Phase 3 — AI Coach**.

## Last Updated
2026-06-17
