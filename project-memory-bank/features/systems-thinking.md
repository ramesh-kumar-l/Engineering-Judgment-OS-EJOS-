# Feature: Systems Thinking

**Status: Implemented (Phase 2).**
- `src/screens/SystemsWorkspaceScreen.tsx` — list/shell (master/detail)
- `src/screens/SystemMapEditor.tsx` — the editor (parts, connections, loops, leverage, reflection)
- `src/components/SystemMapDiagram.tsx` — read-only live SVG diagram

Master/detail over **System Maps**. A map captures:
- Title + description (the system and its boundary)
- **Parts** (nodes) — variables/actors/components, each with a stable id
- **Connections** — directed causal links `A → B` with **polarity** (reinforcing = amplifies, balancing = stabilizes) and a note. **No numeric weights** (design rule).
- **Feedback loops** (list) — where effects circle back
- **Leverage points** (list) — small change → large effect
- **Reflection** — what mapping revealed; second-order effects, surprises

A live read-only **SVG diagram** lays nodes on a ring and draws polarity-colored directed edges. It updates as you edit. Deliberately **not** drag-and-drop: deterministic auto-layout is stable, offline, and dependency-free.

All edits persist immediately to IndexedDB (`saveSystemMap`). Reactive list via `useLiveQuery`. Deleting a part prunes any connections that reference it.

## Not yet (later)
- AI coaching on the map (missing loops, blind spots) — Phase 3.
- Manual node positioning / richer canvas — only if a real need emerges (kept out of v1 for stability).
