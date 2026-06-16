# System Architecture

## Constraints
- **AD-001 Offline-first:** local store is the source of truth; the app shell loads and fully functions with no network. The AI Coach is an *additive, online-only* layer that degrades gracefully (queue requests; never block core workflows).
- Design goals: calm, fast, premium, minimal (Linear / Raycast / Notion / Vercel).
- Single primary user initially (the founder). No multi-tenant/enterprise concerns yet.

## AD-002 — Resolved Stack
**Decision: Local-first Progressive Web App (PWA).** Rationale: it satisfies offline-first natively (service worker + on-device DB), is cross-device, has the lowest build/deploy friction, and gives the premium SPA feel the design goals demand — without standing up a backend on day one.

| Layer | Choice | Why |
|-------|--------|-----|
| Language | TypeScript | Type safety across a long-lived personal product |
| Build/App | Vite + React (SPA) | Fast, simple, static-deployable; no server needed for offline-first |
| Styling | Tailwind CSS | Precise control for a Linear/Vercel-grade minimal UI |
| State | Zustand | Minimal, ergonomic, no boilerplate |
| Local store | IndexedDB via **Dexie** | Durable on-device source of truth; structured queries |
| Offline shell | Service Worker (Workbox / Vite PWA plugin) | App loads & runs with no network |
| AI Coach | **Claude API** (online-only) | Coaching layer added in Phase 3; additive per AD-001 |
| Packaging (future) | Tauri wrapper possible later | Same web codebase → native desktop if/when desired, no rewrite |

> Reversible: if true *offline AI* becomes a requirement, revisit with a small local model. Out of scope for now.

## High-Level Architecture
```
┌─────────────────────────────────────────────┐
│                 React SPA (UI)               │
│  Session · Framing · Systems · Decisions ... │
├─────────────────────────────────────────────┤
│        Domain Layer (TS, pure logic)         │  ← judgment models, no I/O
├─────────────────────────────────────────────┤
│      Local Data Layer (Dexie/IndexedDB)      │  ← SOURCE OF TRUTH (offline)
├───────────────┬─────────────────────────────┤
│ Service Worker│   AI Coach Adapter (online)  │
│ (offline shell)│  → Claude API, queued/optional│
└───────────────┴─────────────────────────────┘
```

## Data Storage (local-first)
- All entities (`Problem`, `Decision`, `SystemMap`, `Session`, `Review`, `Insight`) persist to IndexedDB.
- Writes are synchronous-feeling and never depend on network.
- Schema lives in `architecture/database-schema.md` (drafted in Phase 1).

## AI Coach Integration (online-only, graceful degradation)
- AI requests run through an adapter that checks connectivity.
- Offline → request is **queued** and the UI clearly shows "coaching pending (offline)"; the user's manual workflow is never blocked.
- Online → adapter calls Claude API; responses must carry evidence + reasoning (see `07-ai-coach-framework.md`).

## Sync Strategy (additive, future)
- v1 is single-device, no sync, no account required.
- Optional later: end-to-end encrypted sync or export/import. Never a requirement for daily use.

## Module Boundaries
Domain logic is pure and storage-agnostic (testable without a DB). UI never talks to Claude directly — only through the AI Coach adapter. The local data layer is the only thing that owns persistence.
