---
title: "Designing an Android Fitness Tracker With Engineering Judgment, Not Vibes"
subtitle: "Before a line of Kotlin: the framing, the system map that found the one variable that matters, and three decisions with their predictions — a worked case study in how to think before you build."
tags: [android, mobile-development, system-design, architecture, engineering]
canonical_platforms: [Medium, LinkedIn]
reading_time: 9 min
---

# Designing an Android Fitness Tracker With Engineering Judgment, Not Vibes

Here's a tell that separates junior and senior engineers: hand them "build a fitness tracker"
and the junior opens Android Studio. The senior opens a notebook.

The technical problem — count steps, log workouts — is solved and has been for a decade. The
*real* problem is that most fitness apps are downloaded, used for two weeks, and abandoned.
Optimize for the wrong problem and you'll ship a technically perfect app nobody wears.

This is a worked case study in thinking *before* building. I recorded the whole thing in
**EJOS**, my judgment-training tool, as a "golden example" — so if you clone the repo and click
**Settings → Load golden examples**, you can read every artifact below inside the app and
follow the reasoning end to end. No code yet. Just the judgment that should precede it.

## Framing: the real problem isn't accuracy, it's abandonment

The framing artifact starts by refusing the handed-down problem:

> Most fitness apps are downloaded, used for two weeks, and abandoned. The obvious technical
> problem — count steps, log workouts — is solved. The real problem is **sustained trust and
> habit.** What makes a user keep an Android tracker running after the novelty fades?

Writing the assumptions as explicit risks immediately surfaces the things that actually decide
the product's fate:

- Perceived **consistency** matters more to retention than raw accuracy.
- **Battery drain** is the silent killer of any daily-wear app.
- Users *won't* grant every permission up front.
- Offline logging (gym basements, planes, trails) is a **core requirement, not an edge case.**

And the root-cause chain lands somewhere most "tutorials" never go:

> Why do people quit? → The app feels unreliable or eats their battery. → Why unreliable? →
> Background work gets killed by Doze and aggressive OEM battery managers, leaving silent data
> gaps that erode trust. **Root cause: fighting the platform's power model instead of designing
> with it.**

That's the whole game for an Android background app, and we found it before naming a single
class.

## The system map: one variable sits on both loops

A **system map** is where this case study earns its keep. I mapped what keeps a tracker on the
wrist, and two loops appeared.

The reinforcing (value) loop — the one you want spinning:

```
worn more → more sensor sampling → more data → more trust → worn more
```

The balancing (limiting) loop — the one that kills you:

```
more sampling → more battery drain → OS background-kill (Doze/OEM) → data gaps → trust erodes
```

Stare at those two and something jumps out: **`sensor sampling` is on both loops at once.** It's
the engine of value *and* the source of the drain that triggers the kills that destroy value.
That makes sampling strategy the single highest-leverage decision in the entire system — which
is exactly what the map records as its leverage point:

> Sampling strategy is THE leverage point. Prefer low-power hardware step/motion sensors, batch
> reads, and defer with WorkManager to ride the OS power model instead of fighting it.

A second leverage point falls out of the trust loop: **make missing data honest, not silently
faked** — because gaps *will* happen, and how you handle them is a trust decision, not a UI
detail.

I want to be precise about what just happened, because it's the reusable skill: I didn't pick
an architecture from experience and rationalize it. The map *derived* the most important
decision from the structure of the problem. Different problem, same method.

## Three decisions, each with a prediction

In EJOS a decision carries context, the options weighed, the reasoning, a confidence level, and
a falsifiable prediction. Here are the three that define the tracker.

**Decision 1 — Hardware step-counter + batched sensors, not a foreground service.** The leverage
point made this almost forced. Options: a persistent foreground service polling the
accelerometer; the hardware Step Counter + WorkManager batching; or continuous GPS. Reasoning:

> The hardware step-counter runs on a low-power co-processor — it counts even while the app
> sleeps, at almost no battery cost. A foreground service is reliable but burns battery and nags
> the user with a permanent notification. Continuous GPS is the worst offender. Cooperating with
> the OS power model beats fighting it.

Confidence: **medium** — honest, because Doze behavior varies by OEM. Prediction: *"battery cost
becomes negligible; small gaps during deep Doze need backfilling from the counter's cumulative
total."* Reviewed outcome: the cumulative design means **gaps self-heal** — the next read
recovers total steps since boot — at the cost of handling the boot event that resets the
baseline. The prediction was close, and the place it was incomplete (boot handling) is logged.

**Decision 2 — Just-in-time permissions, not an up-front wall.** Options ranged from "request
everything on first launch" to "engineer most features to need zero permissions." Reasoning: a
wall of permission dialogs on first launch is a top uninstall trigger; asking for location only
when the user starts a GPS run — with a one-line *why* — converts far better. Confidence:
**low**, recorded honestly, with the prediction (*higher grant rate, lower first-session
uninstall, at the cost of a denied-permission path in every feature*) left **open** — a loop to
close once there's real install data. EJOS's Weekly Review flags it as an open prediction, which
is the point.

**Decision 3 — Room as the offline-first source of truth.** Same principle that powers EJOS
itself: a tracker that needs signal to log a workout is broken exactly where workouts happen.
Room is canonical; cloud sync becomes a later, *additive* background job, not a prerequisite.
Confidence: **high**. The predicted future cost — conflict resolution once multi-device sync
lands — is named now so it surprises no one later.

## The experiment: challenge the assumption you didn't know you had

The last artifact is an **innovation experiment** that challenges a buried assumption: *that
engagement requires an attention-grabbing app you open daily.*

> What if the best tracker is nearly **invisible** — captures passively, surfaces one honest
> insight a week as a notification, and deliberately shows *fewer* metrics?

The insight: inverting "engagement = daily opens" reframes the entire UX around trust and calm.
Fewer, higher-trust numbers build more lasting habit than a noisy dashboard — the same restraint
EJOS applies by refusing to show scores. Worth noticing that the discipline transferred between
two completely different products.

## The payoff: a build plan derived, not guessed

Add it up and — before any Kotlin — there's a defensible architecture: hardware-sensor-first
data capture, WorkManager-scheduled batching that respects Doze, just-in-time permissions with
graceful fallbacks, a Room source of truth, and a "calm" UX bet. Every one of those traces back
through a decision, to a leverage point on the system map, to the abandonment root cause in the
framing.

That's what "engineering judgment, not vibes" means in practice: an unbroken chain from the real
problem to the technical choice. Load the golden examples and you can walk that chain yourself.

In the final post of this series, I put the two case studies side by side — building a thinking
tool and designing a fitness tracker — and pull out the transferable patterns that showed up in
both.

---

*This fitness-tracker case study is one of two golden examples shipped with EJOS, an offline-first
PWA for recording engineering judgment. Load it via Settings → Load golden examples and tell me
which decision you'd push back on.*
