# Current State

> Always read this file first. Update it after every meaningful change.

## Current Phase
Phase 0 — Foundation — **COMPLETE** (awaiting approval to start Phase 1)

## Current Sprint
None active. Next: Phase 1 — Core Daily Workflow (pending approval).

## Completed Features
- Memory Bank scaffolding (full structure + `current-state.md`).
- Phase 0 foundation docs: Product Vision (`01`), User Personas (`02`), System Architecture (`04`), Design System (`06`).

## In Progress Features
- (none)

## Pending Features
- Phase 1: Auth, Daily Session, Problem Framing, Decision Journal
- Phase 2+: see `10-phase-roadmap.md`

## Architecture Decisions
| ID | Decision | Status |
|----|----------|--------|
| AD-001 | **Offline-first.** Local store is source of truth; app fully usable with no network; AI Coach is additive/online-only and degrades gracefully. | Accepted |
| AD-002 | **Stack:** Local-first PWA — TS + Vite + React, Tailwind, Zustand, Dexie/IndexedDB, Service Worker; Claude API for AI Coach (online-only). | Accepted (reversible) |

## Known Risks
- R-001: Offline-first + online AI Coach boundary → AI features unavailable offline. Mitigation: AI additive, queued, never blocks core workflows. (see `12-risk-register.md`)

## Known Bugs
- (none — no code yet)

## Technical Debt
- (none yet)

## Next Recommended Task
Begin **Phase 1 — Core Daily Workflow**, starting with project scaffolding (Vite + React + TS + Tailwind + Dexie PWA shell) and the Today's Thinking Session screen. Define domain model (`05`) + DB schema (`architecture/database-schema.md`) first.

## Last Updated
2026-06-16
