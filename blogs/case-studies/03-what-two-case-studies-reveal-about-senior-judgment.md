---
title: "Two Case Studies, One Method: What Senior Engineering Judgment Actually Looks Like"
subtitle: "A thinking tool and a fitness tracker have nothing in common — except the exact reasoning patterns that produced both. Here are the five that transfer."
tags: [engineering-leadership, decision-making, system-design, career-growth, software-engineering]
canonical_platforms: [Medium, LinkedIn]
reading_time: 8 min
---

# Two Case Studies, One Method: What Senior Engineering Judgment Actually Looks Like

In the first two posts of this series I walked through two completely unrelated design problems,
recorded as worked examples in **EJOS**, my judgment-training tool:

1. **Building EJOS itself** — a local-first PWA for recording how you think.
2. **Designing an Android fitness tracker** — a background, battery-bound mobile app.

Different platforms, different stacks, different users. And yet the *reasoning* that produced
each one is nearly identical. That's the actual thesis of this whole project: senior judgment
isn't a library of answers, it's a small set of **reusable thinking moves** you apply to any
problem. Here are the five that show up in both case studies — and they're loadable in the app,
via **Settings → Load golden examples**, if you want to read the primary sources.

## 1. Refuse the problem you were handed

Both case studies open by rejecting the obvious framing.

- The fitness tracker's handed-down problem is "count steps." The recorded framing replaces it
  with *"most trackers get abandoned in two weeks — the real problem is sustained trust and
  habit."*
- EJOS's handed-down problem is "thinking exercises." The framing replaces it with *"the
  decision→outcome loop is never deliberately closed."*

In both, the first real act of engineering was **re-framing**, and in both the better frame
pointed at a root cause the surface problem hid. The junior move is to optimize the given
problem efficiently. The senior move is to ask whether it's the right problem before spending a
single sprint on it.

## 2. Make assumptions explicit, because invisible assumptions are unpriced risk

Each framing lists its assumptions as a flat, uncomfortable list — *"battery drain is the silent
killer," "a numeric score would corrupt the practice," "offline is a core requirement, not an
edge case."*

Writing them down does something subtle: it converts a vibe ("eh, battery's probably fine") into
a **claim you can be wrong about**. Half of those assumptions later became the load-bearing
constraint of the whole design. You cannot manage a risk you never named.

## 3. Find the variable that sits on two loops

This is the most transferable move in the set, and a **system map** is how you find it.

- In the fitness tracker, *sensor sampling* is on both the value loop (sampling → data → trust)
  and the kill loop (sampling → battery drain → OS kills → gaps). That dual role is precisely
  what makes it the highest-leverage decision.
- In EJOS, *friction* sits on the balancing loop that can stall the entire reinforcing loop of
  practice → review → calibration.

When one variable is on two loops at once, it's almost always where your leverage is — and where
your design should concentrate. Both maps turned a *preference* ("use low-power sensors," "make
it offline-first") into a *derived requirement*. That's the difference between rationalizing a
choice and deriving it.

## 4. Attach a prediction to every decision — and leave some open

In both case studies, a decision isn't "what I chose." It's context, options, reasoning,
**confidence**, and a falsifiable **prediction**.

And the confidence is recorded *honestly*: the fitness tracker's permission strategy is logged at
**low** confidence, the sensor strategy at **medium**, the storage choice at **high**. Senior
engineers aren't uniformly confident — they're *calibrated*, and they say so.

Most importantly, both examples deliberately leave a prediction **open** — the fitness tracker's
onboarding bet, EJOS's storage bet. When you load the examples and open the **Weekly Review**,
EJOS detects those open loops and asks you to close them:

> *Predictions still open: a decision you made earlier still has no actual outcome recorded.
> Closing these loops is where judgment compounds.*

The open loop isn't a bug in the example. It's the entire point. Judgment improves only when you
go back and check whether you were right — and almost nobody does, because nothing reminds them.

## 5. Let restraint be a feature

The most counterintuitive pattern is that the strongest decision in *each* case study was a
refusal:

- EJOS **refuses to score** the user (scoring judgment would corrupt it — Goodhart's Law).
- The fitness tracker **refuses the noisy dashboard**, betting that fewer, higher-trust metrics
  build more lasting habit than showing everything.

Same instinct, two domains: knowing what *not* to build is often higher-leverage than any
feature you add. Juniors are measured by what they ship; seniors are increasingly measured by
what they talk the team *out* of shipping.

## Why this is the real hiring signal

Anyone can list technologies. "Local-first PWA, IndexedDB, Service Worker, WorkManager, Room" is
a keyword soup a résumé can fake in thirty seconds.

What's hard to fake is the **method** — and the method is visible in these artifacts in a way a
finished repo never shows: a framing that found a non-obvious root cause, a system map that
derived the key decision from structure, decisions with honest confidence and committed
predictions, and the discipline to go back and grade those predictions.

That's the thing I actually want a staff engineer or a hiring manager to see. Not that I can
build a fitness tracker or a PWA — that the *way* I reason about one transfers cleanly to the
other. Clone the repo, load the two golden examples, and judge the method for yourself. That's
the most honest interview I can offer.

---

*This is the final post in a three-part case-study series on EJOS, an offline-first PWA for
recording engineering judgment. Both worked examples ship with the app — Settings → Load golden
examples. If you disagree with any decision in them, that's exactly the conversation I'm here
for.*
