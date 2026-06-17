---
title: "Designing an AI Coach That Refuses to Grade You"
subtitle: "A pluggable LLM layer that runs on Claude, Gemini, or a local model — and why the most important feature is the one it won't do."
tags: [ai, llm, architecture, prompt-engineering, ollama, claude]
canonical_platforms: [Medium, LinkedIn]
reading_time: 8 min
---

# Designing an AI Coach That Refuses to Grade You

Bolting an LLM onto a product in 2026 is easy. The npm install takes thirty seconds. The
interesting engineering isn't *connecting* the model — it's deciding what the model is
allowed to do, making sure your app never marries a single vendor, and ensuring the feature
degrades gracefully to nothing when there's no network.

For **EJOS** (a tool for training engineering judgment), the AI Coach had three hard
requirements, and each one taught me something worth writing down:

1. It must run **offline** — a local model — not just against a cloud API.
2. The app must **never depend on a specific vendor.**
3. It must **never grade or score the user.** This was a product invariant, and it shaped
   the prompts more than anything else.

## Requirement 1: don't marry a vendor — the `LLMProvider` interface

The single most important architectural decision was refusing to let `fetch('api.anthropic...')`
leak into my UI. Instead, the entire app depends on one small interface:

```ts
// ai/types.ts
export interface LLMProvider {
  name: string;
  complete(prompt: string, opts: CompleteOptions): Promise<string>;
  test(): Promise<boolean>;   // for the Settings "Test connection" button
}
```

Then there are three implementations, each in its own file under `ai/providers/`:

- `claude.ts` — Anthropic's API
- `gemini.ts` — Google's API
- `ollama.ts` — a **local** model running on your machine

A tiny factory resolves the right one from user settings:

```ts
// ai/providers/index.ts
export function getProvider(settings: AISettings): LLMProvider {
  switch (settings.provider) {
    case 'claude': return makeClaude(settings);
    case 'gemini': return makeGemini(settings);
    case 'ollama': return makeOllama(settings);
  }
}
```

The coaching logic — `runCoaching()` in `ai/coach.ts` — never knows or cares which model
answered. It builds a prompt, calls `provider.complete(...)`, and persists the result. This
is just the **Strategy pattern**, but in the LLM era it's load-bearing: model quality,
pricing, and availability change monthly. An app hard-coded to one vendor is one pricing
change away from a rewrite. EJOS swaps providers by changing a dropdown.

> The discipline here is the same one good engineers apply to databases or payment
> providers: **depend on an interface you own, not an SDK someone else ships.**

## Requirement 2: offline AI is a real thing now (Ollama)

The most common objection to "offline-first + AI" is that they're contradictory. They're
not — not anymore. [Ollama](https://ollama.com) runs capable open models (`qwen3`, `gemma3`,
etc.) entirely on your machine. Because EJOS already treats the network as optional, the
Ollama provider slots right in: same `LLMProvider` interface, just pointed at
`http://localhost:11434`.

There was exactly one sharp edge, and it's worth flagging because it'll bite anyone doing
this: **browser CORS.** A web page calling `localhost:11434` is a cross-origin request, and
Ollama blocks it by default. The fix is to start Ollama allowing your app's origin:

```bash
OLLAMA_ORIGINS=http://localhost:5173 ollama serve
```

I documented this as a known risk (R-003) and made the Settings "Test connection" button
surface the failure clearly, because a silent CORS failure is a brutal first-run experience.
The lesson: when you integrate a local service, the *boundary* (CORS, ports, lifecycle) is
where all the real bugs live — design the error messages for it deliberately.

## Requirement 3: the coach asks questions — it never grades

This is the part I care about most, and it's a *prompt-engineering* decision as much as an
architecture one.

It would have been trivial to make the AI output "Decision quality: 7/10. Confidence
calibration: B-." Users even *ask* for it — numbers feel like progress. I refused, on
purpose, for a reason rooted in incentives:

**The moment you score judgment, the user optimizes for the score, not the judgment.**

They'd start writing framings that *look* rigorous to please the grader instead of framings
that are *honest*. The product would erode the exact skill it exists to build. That's
Goodhart's Law operating on the most important variable in the whole system.

So the system prompt is explicit about what the coach is and isn't:

> *You are a thinking coach for an engineer. Your job is to surface blind spots and ask
> sharper questions — never to grade, score, rank, or rate. Do not output numbers,
> letter grades, or quality verdicts. Point at what's missing and ask a better question.*

Then each artifact type gets its own prompt builder in `ai/prompts.ts`:

- **Problem framing** → *"What stakeholder isn't named here? What assumption, if false,
  collapses this framing?"*
- **Decision** → *"What would have to be true for the option you rejected to be the right
  one?"*
- **System map** → *"Where's the feedback loop you haven't drawn? What's the second-order
  effect of your leverage point?"*
- **Innovation experiment** → *"What 'sacred' constraint are you still treating as fixed?"*

The coach pushes you to think *more*, never to feel *judged*. And because it's additive,
when there's no model configured the app loses nothing — every manual workflow stands on its
own.

## The architecture in one picture

```
UI (screens)
   │ depends only on ↓
runCoaching()  →  LLMProvider (interface)
                      ├── ClaudeProvider   (online)
                      ├── GeminiProvider   (online)
                      └── OllamaProvider    (offline, local)
prompts.ts builds per-artifact prompts · "never grade" enforced in the system prompt
results persisted per-artifact in IndexedDB (one Coaching row per artifact)
```

## Three takeaways for anyone integrating LLMs

1. **Hide the vendor behind an interface you own.** The model market moves too fast to
   couple your product to one SDK. A 12-line interface buys you optionality for free.

2. **Treat offline/local models as first-class.** Ollama + a clean provider abstraction
   means "AI" doesn't have to mean "send the user's private data to a third party." For a
   tool built on trust, that's not a nice-to-have.

3. **Decide what the model is *not allowed* to do.** The hardest and most valuable design
   work was a constraint — *never score the user* — not a capability. In LLM products,
   restraint is a feature. Your prompts encode your product's values; write them like you
   mean it.

The flashy part of an AI feature is the output. The durable part is the boundary you draw
around it.

---

*EJOS runs its AI Coach on Claude, Gemini, or a fully-local Ollama model through one
provider interface — and it will never give you a number. If you're building LLM features,
I'm always up for trading notes on provider abstraction and prompt design.*
