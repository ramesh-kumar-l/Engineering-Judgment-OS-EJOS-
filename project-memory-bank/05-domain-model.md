# Domain Model

Implemented in `src/domain/types.ts` (pure types, no I/O).

## Core Entities (Phase 1)
### Session — the daily thinking session (home / hero)
| Field | Type | Notes |
|-------|------|-------|
| id | string (uuid) | |
| date | ISODate `YYYY-MM-DD` | one primary session per calendar day |
| problemStatement | string | answer to "What problem are you thinking about today?" |
| createdAt / updatedAt | epoch ms | |

### Problem — Problem Framing artifact
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| sessionId | string? | optional link to the day's session |
| title | string | |
| statement | string | |
| assumptions | string[] | each assumption = a risk |
| stakeholders | string[] | who's affected / incentives |
| rootCauseNotes | string | |
| createdAt / updatedAt | epoch ms | |

### Decision — Decision Record
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| sessionId | string? | |
| title, context | string | |
| options | string[] | alternatives weighed |
| chosenOption | string | |
| reasoning | string | tradeoffs named |
| confidence | 'low'\|'medium'\|'high' | **no numeric scores** |
| expectedOutcome | string | prediction at decision time |
| actualOutcome | string | filled during later review |
| status | 'open'\|'reviewed' | |
| createdAt / updatedAt | epoch ms | |

## Systems Thinking Entities (Phase 2)
### SystemMap — a model of parts and how they affect each other
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| sessionId | string? | optional link to the day's session |
| title, description | string | system + its boundary |
| nodes | `SystemNode[]` | `{ id, label }` — each part carries a stable id |
| connections | `SystemConnection[]` | `{ id, fromId, toId, polarity, note }` directed causal links |
| feedbackLoops | string[] | reinforcing / balancing loops spotted |
| leveragePoints | string[] | where a small change → large effect |
| reflection | string | what the map revealed (second-order effects) |
| createdAt / updatedAt | epoch ms | |

`Polarity = 'reinforcing' | 'balancing'` — **no numeric weights** (design rule). Deleting a node prunes connections that reference it.

## AI Coach Entities (Phase 3)
### Coaching — latest coach note for one artifact (one row per artifact)
| Field | Type | Notes |
|-------|------|-------|
| id | string | = the coached artifact's id |
| targetKind | 'problem' \| 'decision' \| 'systemMap' | |
| content | string | coach response text (never a grade/score) |
| provider / model | string | which LLM produced it |
| createdAt | epoch ms | |

### AISettings — provider config (single row, id='ai'); see `src/ai/types.ts`
Stores `provider` (claude \| gemini \| ollama), per-provider API keys + model names, and Ollama base URL. Stored locally only.

> `Coaching.targetKind` now also accepts `'experiment'` (Phase 4) and `'review'` (Phase 5).

## Innovation Lab Entities (Phase 4)
### Experiment — a status-quo-challenging experiment run through one lens
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| sessionId | string? | optional link to the day's session |
| title, subject | string | what's being reimagined |
| technique | `LabTechnique` | `'assumptions' \| 'first-principles' \| 'redesign'` — the active lens |
| assumptionChallenges | `AssumptionChallenge[]` | `{ id, assumption, challenge }` pairs |
| fundamentals | string[] | irreducible truths (first-principles lens) |
| reconstruction | string | rebuild from fundamentals |
| constraintsToDrop | string[] | "sacred" constraints to question (redesign lens) |
| reimagined | string | the bolder alternative |
| insight | string | what shifted / the next bet |
| createdAt / updatedAt | epoch ms | |

The technique toggle is non-destructive: switching lenses hides but never deletes the other sections' data. **No numeric scoring** anywhere.

## Weekly Review Entities (Phase 5)
### Review — a weekly reflection (one row per week)
| Field | Type | Notes |
|-------|------|-------|
| id | string | = `rangeStart` (one review per week) |
| rangeStart | ISODate | inclusive — Monday of the week |
| rangeEnd | ISODate | exclusive — the next Monday |
| notes | string | what stood out this week |
| insight | string | what I'm carrying into next week |
| createdAt / updatedAt | epoch ms | |

Created **lazily** on first edit. Patterns are **recomputed live** from artifacts (`src/review/patterns.ts`, pure) — not stored — so a `Review` holds only the founder's durable reflection. **No numeric scoring** (counts + confidence mix are descriptive only).

## Cognitive Repository Entities (Phase 6)
### Connection — an undirected link between two artifacts (a thinking-graph edge)
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| fromKind / toKind | `ArtifactKind` | `'session' \| 'problem' \| 'decision' \| 'systemMap' \| 'experiment' \| 'review'` |
| fromId / toId | string | the two linked artifacts' ids |
| note | string | why they relate (optional) |
| createdAt | epoch ms | |

The founder draws connections manually — nothing is inferred. `connections` store added in Dexie **v6**. Artifacts are normalized into a uniform `ArtifactRef` (`src/cognitive/artifacts.ts`, pure) for search and the graph. **No numeric scoring.**

## Relationships
- A `Session` loosely groups the `Problem`s and `Decision`s created that day (via `sessionId`). Artifacts also stand alone in their own lists.
