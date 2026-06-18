---
title: "Watching an Engineer Think: The Decisions Behind EJOS, Recorded as EJOS Artifacts"
subtitle: "I used my judgment-training tool to design the judgment-training tool. Here is the actual paper trail — framing, system map, decisions, and the prediction I left open on purpose."
tags: [software-engineering, decision-making, architecture, systems-thinking, career]
canonical_platforms: [Medium, LinkedIn]
reading_time: 8 min
---

# Watching an Engineer Think: The Decisions Behind EJOS, Recorded as EJOS Artifacts

Most engineering writing shows you the destination — the finished architecture, the clean
diagram, the confident "here's why we chose X." What it almost never shows you is the
*thinking*: the assumptions that were on the table, the options that lost, the prediction the
author made and whether it came true.

That gap is the whole reason I built **EJOS (Engineering Judgment OS)** — a local-first tool
for recording how you think through hard problems so you can review it later. And the most
honest way to show what it does is to point it at itself.

So this post is a case study with no narration tax: it's the literal set of EJOS artifacts I
created while designing EJOS. If you clone the repo and click **Settings → Load golden
examples**, every artifact below appears in the app, searchable and connected. You can read
the reasoning *in the tool the reasoning produced.*

## Step 1 — Framing: don't solve the problem you were handed

The first artifact isn't a decision. It's a **problem framing**, because the most expensive
mistakes happen before any code is written — in solving a crisp version of the wrong problem.

The naive framing of EJOS is "an app with some thinking exercises." The framing I actually
recorded is sharper:

> Senior engineering is mostly judgment — framing, tradeoffs, second-order effects — yet
> there's no deliberate-practice tool for it. Can a fast daily tool make that practice
> deliberate *without turning thinking into a vanity metric?*

The framing forced me to write down assumptions as **risks**, which is the only way they stop
being invisible:

- Judgment improves with deliberate, reflective practice — not just years of exposure.
- Engineers will only return daily if the tool is instant and works offline.
- A numeric "judgment score" would *corrupt* the practice (Goodhart's Law).

Then the root-cause notes, asking "why" until it stops giving:

> Why is judgment hard to teach? → It's tacit and context-dependent. → Why does it take
> years? → The feedback loop between a decision and its outcome is months long and rarely
> revisited. **Root cause: the decision→outcome loop is almost never deliberately closed.**

That single line reframed the entire product. EJOS isn't "thinking exercises." It's a machine
for *closing the loop* between a decision and its outcome. Everything downstream inherits from
that.

## Step 2 — A system map: find the variable that's on two loops at once

Framing tells you *what*. A **system map** tells you *where the leverage is*. I mapped the
loop that actually makes judgment compound:

```
practice → recorded decisions → reviewed outcomes → calibrated judgment → (back to) practice
```

That's a reinforcing loop: better judgment makes practice rewarding, which produces more
practice. But there's a second, balancing loop hiding next to it:

```
friction (slow load, network dependence) → lower trust → fewer return visits → the loop stalls
```

Drawing both made the priorities un-ignorable, and they're recorded as the map's **leverage
points**:

1. **Make "closing the loop" effortless.** Recording the *actual outcome* is the link humans
   always skip — so the product has to nag gently on open predictions.
2. **Drive friction toward zero.** If load time or a network round-trip can break the daily
   habit, the compounding loop never gets going.

Notice what just happened: a product requirement ("offline-first, instant") fell directly out
of a *systems* observation, not a gut preference. That's the difference between "I like PWAs"
and "the balancing loop in my own map says network friction will kill retention."

## Step 3 — Decisions, with predictions attached

Now the decisions — and in EJOS a decision isn't just "what I chose." It's *context, options,
reasoning, a confidence level, and a prediction you can be wrong about later.*

**Decision: local-first PWA over native or Electron.** Options on the table included native
mobile, Electron, and the classic React + REST + Postgres. The reasoning, recorded at the
time:

> REST + Postgres makes the network mandatory — fatal for a "think on a plane" tool. Electron
> ships a 100MB+ runtime to render forms. A PWA lets the browser *be* the backend. The trade I
> am consciously accepting: no multi-device sync in v1, and client-side secrets.

Confidence: **high**. Prediction: *"I ship six phases with no backend; the main regret will be
the absence of sync."* Reviewed outcome, recorded later: that's exactly what happened. The
hardest distributed-systems problem — client/server sync — was *designed out*, and sync is the
single most-wished-for gap. The point of writing the prediction down is that I don't get to
rewrite my memory of it afterward.

**Decision: the coach asks questions, never grades.** This is the one I'd defend hardest. Users
*want* a number — "judgment: 7/10" feels like progress. I refused, and the reasoning is pure
incentive design:

> The moment you score judgment, the user optimizes for the score, not the judgment. They start
> writing framings that *look* rigorous to please the grader instead of being honest. The
> product erodes the exact skill it exists to build.

Restraint as a feature. (There's even a unit test enforcing that no detected pattern ever
carries a number — the philosophy has teeth.)

## Step 4 — The prediction I left open on purpose

There's a third decision — *"IndexedDB is the source of truth, not a cache"* — and in the
example data I left its **actual outcome blank, status: open.**

That's not laziness; it's the demo's most important teaching moment. When you load the examples
and open the **Weekly Review** for that week, EJOS detects the open loop and surfaces it:

> *Predictions still open: 1 decision you made earlier still has no actual outcome recorded.
> Closing these loops is where judgment compounds — which one can you check now?*

That nudge *is the product.* The whole system exists to make the unclosed loop visible, because
the unclosed loop is where everyone's judgment quietly stops improving.

## Why show the work instead of the result?

Because the result — "it's a local-first PWA with a pluggable AI coach" — is the least
interesting part, and any résumé can claim it. What's hard to fake is the *trail*: a framing
that found a non-obvious root cause, a system map that turned a preference into a derived
requirement, and decisions with predictions I committed to before I knew the answer.

If you want to see how an engineer actually reasons — assumptions, rejected options, confidence,
and all — clone the repo, load the golden examples, and read the artifacts in the tool that
produced them. The next post in this series does the same thing for a problem I *didn't* build:
designing an Android fitness tracker, framed with judgment instead of vibes.

---

*EJOS is an offline-first PWA for recording and reviewing engineering judgment. Everything in
this post is loadable in the app via Settings → Load golden examples. I'd genuinely like to hear
which decision you'd have made differently.*
