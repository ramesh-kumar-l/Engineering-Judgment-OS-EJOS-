---
title: "There's No Gym for Engineering Judgment — So I Built One"
subtitle: "Why the skill that actually defines senior engineers has no place to practice — and what I did about it."
tags: [engineering, career, software, product, judgment]
canonical_platforms: [Medium, LinkedIn]
reading_time: 7 min
---

# There's No Gym for Engineering Judgment — So I Built One

Here's a question that's quietly bothered me for years:

**Why is the most important skill in our entire profession the one we never actually practice?**

We practice everything else. We grind LeetCode. We do system-design mocks. We watch
conference talks, read the *Designing Data-Intensive Applications*, build side projects to
learn Rust. There is an enormous, well-funded industry dedicated to teaching engineers
*technical skill*.

But technical skill isn't what separates a senior engineer from a staff engineer, or a
staff engineer from a principal. Ask anyone who's been promoted into those rooms. The thing
that separates them is **judgment**: the ability to frame an ambiguous problem before
charging at it, to see the second-order effects in a system, to make a hard call under
uncertainty and own the outcome.

And judgment has no gym.

## How engineers actually acquire judgment today

Slowly. Accidentally. Expensively.

You make a call. Eighteen months later it blows up in production, or it quietly works, and
*maybe* — if you're reflective and lucky — you connect the consequence back to the
reasoning. You absorb a lesson. You repeat this a few hundred times over a decade and people
start calling you "senior."

That's not a training method. That's **survivorship-biased osmosis.** It's the equivalent of
trying to get strong by occasionally lifting heavy objects when life happens to hand them to
you. No athlete trains that way. No musician. No surgeon. They have deliberate, structured,
daily reps with feedback.

Engineers have... a Jira board and hope.

## The three things missing

When I looked closely at why judgment doesn't compound the way technical skill does, I found
three structural gaps:

1. **No structured place to practice.** There's no daily ritual that says *"frame this
   problem properly before you write code."* Framing happens in your head, fast, and
   invisibly — which means it never improves.

2. **No durable record.** Decisions evaporate. You rarely write down *why* you chose
   something or *how confident* you were. So when reality returns a verdict, there's nothing
   to compare it against. The feedback loop is broken at the source.

3. **No reflection surface.** Even people who journal don't review their *thinking* — they
   review their tasks. Nobody asks, "What patterns show up in how I frame problems? Where am
   I consistently overconfident?"

Fix those three things and judgment stops being something that happens *to* you and becomes
something you *train*.

## Enter EJOS — Engineering Judgment OS

So I built the gym. It's called **EJOS — Engineering Judgment OS**, and it's an
offline-first app built around one daily ritual and a simple, almost stubborn philosophy.

The home screen asks one question: **"What problem are you thinking about today?"**

From there you can:

- **Frame the problem** — surface your assumptions, the stakeholders, the actual root cause,
  *before* you jump to a solution. (Most bad engineering is a great solution to the wrong
  problem.)
- **Map the system** — externalize the parts and the causal links between them. Mark each
  link *reinforcing* or *balancing*. Find the feedback loops and the leverage points. You
  can't reason about a system you can only hold in your head.
- **Record decisions** — the options, your reasoning, your **confidence (low / medium /
  high)**, and what you *expect* to happen. Later, you record what *actually* happened.
- **Reflect weekly** — the app surfaces patterns in your week's thinking and asks you to sit
  with them for five minutes.

Over weeks, the thing you've built is a **mirror of your own evolving judgment.**

## The one rule I refused to break: no scores

Here's the design decision I'm proudest of, and the one people push back on most:

**EJOS never gives you a number.**

There is no "Decision Quality: 76/100." No streak. No leaderboard. No gamified dopamine
loop. Confidence is qualitative — low, medium, high — not a percentage you'll start gaming.

Why? Because **the moment you score judgment, you optimize for the score instead of the
judgment.** You'd start writing framings that look good rather than framings that are
honest. The product would corrupt the exact skill it's supposed to build. Goodhart's Law
isn't a footnote here — it's the whole risk.

There's an optional AI Coach (you can run it fully offline with a local model). Its entire
job is to *ask you better questions* — "What stakeholder did you not mention?" "What has to
be true for this to work?" — and then get out of the way. It coaches. **It never grades.**

## Why this matters beyond me

I built EJOS for myself first — I'm an engineer who wants to level up deliberately, not wait
a decade for it to accrete. But the bet underneath it is bigger:

**Judgment is trainable.** Not innate. Not the inevitable reward of tenure. A skill — like
any other — that responds to deliberate practice, a durable record, and an honest feedback
loop.

If that's true, the engineers who train it on purpose will pull away from the ones waiting
for it to happen to them.

In the next post, I'll go deep on *how* it's built — because "offline-first" turned out to
be a far more interesting engineering constraint than I expected, and it shaped every
architectural decision in the product.

---

*EJOS is an offline-first PWA. Your thinking is stored locally and never leaves your device.
If "a gym for judgment" resonates, I'd genuinely love to hear how you currently train
yours — reply and tell me.*
