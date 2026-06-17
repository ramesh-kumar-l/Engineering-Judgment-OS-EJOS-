# Build Log

> Append-only. Newest first.

## 2026-06-16
- Bootstrapped Memory Bank spine: `current-state.md` populated; remaining structure files stubbed.
- Recorded AD-001 (offline-first, accepted) and AD-002 (tech stack, open).
- Created folders: `features/`, `architecture/`, `ui/`, `research/`.
- Drafted Phase 0 foundation docs: Product Vision (`01`), User Personas (`02`), System Architecture (`04`), Design System (`06`).
- Resolved AD-002 → Local-first PWA (TS/Vite/React/Tailwind/Zustand/Dexie + Service Worker; Claude API online-only).
- **Phase 0 — Foundation: COMPLETE.** Stopped for approval.
- **Phase 1 — Core Daily Workflow:**
  - Scaffolded PWA: Vite 8 + React 19 + TS (strict) + Tailwind v4 + vite-plugin-pwa.
  - Local data layer: Dexie/IndexedDB (`src/db/database.ts`, `repository.ts`); domain types (`src/domain/types.ts`).
  - Screens: Today's Session (auto-save), Problem Framing, Decision Journal; AppShell + react-router + OfflineBadge.
  - Recorded AD-003 (no auth/accounts in v1; rationale = AD-001).
  - Validation: `npm run build` passes (tsc strict + vite); SW precaches 5 entries (offline shell); `npm run preview` serves HTTP 200.
  - **Phase 1: COMPLETE.** Stopped for approval. Pending: founder browser smoke-test.

## 2026-06-17
- **Phase 2 — Systems Thinking:**
  - Domain: added `SystemMap`, `SystemNode`, `SystemConnection`, `Polarity` (`src/domain/types.ts`).
  - Data: Dexie **v2** migration adds `systemMaps` store; repository CRUD (`createSystemMap`, `saveSystemMap`, `deleteSystemMap`).
  - UI (modular, all <300 lines): `SystemsWorkspaceScreen` (list/shell), `SystemMapEditor` (form: parts, connections, loops, leverage points, reflection), `SystemMapDiagram` (read-only live SVG, ring layout, polarity-colored directed edges).
  - Node delete prunes dangling connections (graph stays consistent).
  - Wired route `/systems` + nav entry "Systems Thinking".
  - Validation: `npm run build` passes (tsc strict + vite); SW precaches 5 entries (408 KiB); `npm run preview` → HTTP 200.
  - **Phase 2: COMPLETE.** Stopped for approval. Pending: founder browser smoke-test.
