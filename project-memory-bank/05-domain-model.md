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

## Future Entities (later phases)
- `Review` (Phase 5), `Insight` (Phase 3/5).

## Relationships
- A `Session` loosely groups the `Problem`s and `Decision`s created that day (via `sessionId`). Artifacts also stand alone in their own lists.
