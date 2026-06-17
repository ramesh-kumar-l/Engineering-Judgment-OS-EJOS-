# Feature: Cognitive Repository

**Status: Implemented (Phase 6).**

The memory layer. Everything the founder has thought through becomes searchable, linkable, and visible as a graph — all local, all offline, no scores.

## Search (`src/cognitive/artifacts.ts`, pure / no I/O)
- `collectArtifacts(all): ArtifactRef[]` — flattens every artifact (sessions, problems, decisions, system maps, experiments, reviews) into a uniform `ArtifactRef { kind, id, title, snippet, text, updatedAt, route }`. `text` is the lowercased searchable haystack (all relevant fields joined).
- `searchArtifacts(refs, query)` — AND-matches every whitespace-separated term against each ref's haystack; empty query returns nothing; results sorted newest-first.
- `indexByKey(refs)` — `Map<"kind:id", ArtifactRef>` for O(1) lookup from connection ends. `refKey(kind, id)` builds the key.

## Connections (the graph edges)
- `Connection` entity (`src/domain/types.ts`): `{ id, fromKind, fromId, toKind, toId, note, createdAt }` — **undirected**; the founder draws them, nothing is inferred.
- `connections` store (Dexie **v6**): `id, fromId, toId, createdAt`. Existing v1–v5 data carries forward.
- Repository: `createConnection(from, to, note?)`, `deleteConnection(id)`.

## Thinking graph (`src/cognitive/ThinkingGraph.tsx`)
- Read-only SVG, ring layout, dependency-free (mirrors `SystemMapDiagram`).
- Shows only artifacts that participate in ≥1 connection; one muted color per kind (legend cue, not a ranking); undirected edge lines.
- Empty state until the first connection exists.

## UI
- `src/screens/RepositoryScreen.tsx` (`/repository`) — search box + results, graph, connections editor. Loads all artifacts + connections via `useLiveQuery`; refs/index/results memoized.
- `src/cognitive/SearchResults.tsx` — presentational hits; each links to its workspace route.
- `src/cognitive/ConnectionsEditor.tsx` — two artifact `<select>`s + optional note → Connect; lists existing connections with delete.

## Design rules honored
- **No numeric scores** anywhere.
- Search + graph are **offline-first** and deterministic; nothing leaves the device.
- Files kept <300 lines (strict modularity): `artifacts.ts`, `SearchResults.tsx`, `ThinkingGraph.tsx`, `ConnectionsEditor.tsx`, `RepositoryScreen.tsx` each well under.
- Surgical/additive: extended `types.ts`/`database.ts`/`repository.ts`/`main.tsx`/`AppShell.tsx` only; no working code rewritten.

## Not yet (later)
- Deep-link search results to the *specific* artifact (today they open the workspace screen; selection isn't auto-applied — the existing master/detail screens manage their own selection).
- Auto-suggested connections (kept manual for v1 — the founder owns the links).
- Graph node click → open artifact; drag layout.
