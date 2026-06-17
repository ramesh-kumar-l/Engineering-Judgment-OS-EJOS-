---
title: "Shipping 6 Phases Without Losing the Plot: Phase-Gated Development With an AI Pair"
subtitle: "How a memory bank, a 300-line file rule, and explicit stop-gates kept a solo + AI build disciplined instead of chaotic."
tags: [engineering, ai-pair-programming, software-process, architecture, productivity]
canonical_platforms: [Medium, LinkedIn]
reading_time: 8 min
---

# Shipping 6 Phases Without Losing the Plot: Phase-Gated Development With an AI Pair

There's a failure mode everyone building with AI coding tools knows but few talk about: the
**enthusiastic mess.** You ask for a feature, the model writes 400 lines, it works, you ask
for the next one, and three days later you have a working app you no longer understand,
files that are 900 lines long, and a context window that costs a fortune to load because
every file is enormous.

I built **EJOS** (Engineering Judgment OS) as a solo engineer working with an AI pair across
six feature phases plus a hardening pass. It didn't become a mess. Not because the AI was
magic, but because I imposed a small set of process constraints up front — the same kind of
constraints a good staff engineer imposes on a team. This post is about those constraints,
because the *process* turned out to be as much of an engineering artifact as the code.

## Constraint 1: phase gates with a hard STOP

I refused to let the project run as one long sprint. It was broken into explicit phases:

> Phase 0 — Foundation · Phase 1 — Core daily workflow · Phase 2 — Systems Thinking ·
> Phase 3 — AI Coach · Phase 4 — Innovation Lab · Phase 5 — Weekly Review ·
> Phase 6 — Cognitive Repository

Each phase ended with a literal rule: **print "PHASE COMPLETE," then STOP and wait for
explicit approval.** No rolling straight into the next thing.

Why does a hard stop matter so much with an AI pair? Because the cost of a wrong turn
compounds. An LLM will happily build Phase 4 on top of a Phase 3 design flaw you haven't
noticed yet. The stop-gate is a **forced review checkpoint** — a moment to run the build,
do a smoke test, read the diff, and decide *consciously* to proceed. It's the same reason
teams do code review before merge instead of after release. The gate converts "momentum"
into "verified momentum."

## Constraint 2: the 300-line file rule (and why it's really a token rule)

Every file in EJOS stays under ~300 lines. When something gets big, it gets split by
responsibility:

- AI providers → `claude.ts`, `gemini.ts`, `ollama.ts` (not one `providers.ts`)
- The Cognitive Repository → `artifacts.ts` (pure logic) + `SearchResults.tsx` +
  `ThinkingGraph.tsx` + `ConnectionsEditor.tsx`
- One screen per route, one concern per file.

For human readability this is just good hygiene. But when your pair is an LLM, it's
something sharper: **a token-economics decision.** If your business logic lives in a 900-line
`services.ts`, the AI has to ingest all 900 lines to safely change 10 of them — every time.
Burning context, slower responses, more chances to hallucinate an edit in a part it didn't
need to touch.

Break that file into focused 100-line modules and the AI reads *only* the one it needs. The
modularity that makes code maintainable for humans is the *same* modularity that makes an AI
pair fast, cheap, and accurate. Strict module boundaries aren't bureaucracy — they're how
you keep the collaboration economical.

## Constraint 3: the memory bank — a compressed "save state"

This is the technique I'd most recommend to anyone doing serious work with an AI assistant.

AI sessions are amnesiac. Context windows fill up and compact; a fresh session knows
nothing. If the *only* record of your architecture decisions lives in a chat transcript,
you've built your project's memory on sand.

So EJOS has a **memory bank**: a `project-memory-bank/` directory of durable markdown that
is the project's real memory. Two files do the heavy lifting:

- **`current-state.md`** — the read-this-first save-state: current phase, completed
  features, architecture decisions (with IDs and status), known risks, technical debt, and
  the single next recommended task.
- **`13-build-log.md`** — an append-only, newest-first log of what changed each session and
  why.

Every session starts by reading `current-state.md` and ends by updating it. The discipline
is exactly the same as keeping an Architecture Decision Record (ADR) log on a team — except
here it doubles as the AI's long-term memory. When a session compacts or a new one starts
cold, the project picks up *exactly* where it left off, because the state was written down,
not remembered.

A concrete example of the payoff: when I needed to integrate the AI Coach (Phase 3), I
didn't re-explain the architecture. The memory bank already recorded **AD-001** (offline-first,
local store is source of truth) and **AD-004** (pluggable LLM). The new work *had* to respect
those accepted decisions — and the record made that automatic instead of a debate.

## Constraint 4: surgical changes only

A rule I held the whole way through: **every changed line must trace to the task at hand.**
No "while I'm here" refactors. No improving adjacent code. No reformatting files I wasn't
asked to touch. If I noticed dead code, I noted it — I didn't delete it.

This is unglamorous and it's *exactly* what separates a senior engineer's PR from a junior's.
The junior PR "improves" five things and is impossible to review. The senior PR changes the
ten lines the ticket needed and nothing else. With an AI pair the temptation to sprawl is
even higher — models love to "help" — so the constraint has to be explicit and enforced.

## Constraint 5: goal-driven, verifiable execution

Vague goals ("make it work") force constant clarification and let bugs hide. So every task
got turned into a verifiable success criterion *before* coding:

- "Add validation" → "write tests for the invalid inputs, then make them pass."
- "Harden the app" → "15 tests green, `npm run build` clean, preview returns HTTP 200,
  manifest embeds the icon."

Strong criteria let the work loop independently and *prove* it's done. The hardening pass,
for instance, wasn't "done" until I could point to: 15 passing tests, a clean strict-TS
build of 58 modules, a service worker precaching 7 entries, and a 200 from the preview
server serving the icon as `image/svg+xml`. Done is a checklist, not a vibe.

## What this looks like as a hiring signal

I'll be direct about why this matters beyond my own project. The industry is rapidly
learning that the engineers who get the most out of AI tools aren't the ones who type
"build me an app" — they're the ones who bring **the discipline of a senior engineer to the
collaboration**: clear phases and gates, tight module boundaries, written-down decisions,
surgical diffs, and verifiable definitions of done.

Those are the same habits that make someone effective on a real team with or without AI. The
AI just makes the *absence* of those habits show up faster and more expensively.

EJOS shipped six coherent phases and a production-hardening pass without turning into the
enthusiastic mess. Not because of the model. Because of the process around it.

In the final post of this series, I'll cover that hardening pass specifically — how I took a
feature-complete app from "works on my machine" to "production-stable," and why the most
valuable change was the one that does nothing until something goes wrong.

---

*EJOS was built phase-by-phase with a memory bank, strict module boundaries, and explicit
stop-gates. If you're figuring out how to work *well* with AI coding tools, I think the
process matters more than the prompt — happy to compare approaches.*
