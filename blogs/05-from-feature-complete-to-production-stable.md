---
title: "From Feature-Complete to Production-Stable: A Hardening Pass on a Solo PWA"
subtitle: "The three changes that took a working app to a stable one — and why the best one does nothing until something breaks."
tags: [production, testing, react, error-handling, pwa, software-quality]
canonical_platforms: [Medium, LinkedIn]
reading_time: 7 min
---

# From Feature-Complete to Production-Stable: A Hardening Pass on a Solo PWA

There's a dangerous moment in every project: the build is green, every feature works in the
happy path, and it *feels* done. "Feature-complete" and "production-stable" sound like
synonyms. They are not. The gap between them is where real users live — the unexpected
render error, the regression six commits later, the install that silently fails.

After finishing all six feature phases of **EJOS** (an offline-first judgment-training PWA),
I deliberately stopped adding features and did a **hardening pass** instead. The rule I set
for myself: *additive and surgical only — don't rewrite working code, just make it harder to
break.* Three changes came out of it, and the ordering wasn't random. I went after the
highest-leverage stability wins first.

## Change 1: an ErrorBoundary — the change that does nothing until it matters

A single-page React app has a brutal failure mode: one uncaught render error anywhere in the
tree, and the **entire app shows a white screen.** For an offline tool someone relies on
daily, that's catastrophic — and there's no server log to even tell you it happened.

The fix is a top-level **Error Boundary**, a React class component that catches render errors
in its subtree and shows a recovery UI instead of unmounting everything:

```tsx
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('EJOS render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return /* a dark-themed recovery card with a "Reload" button */;
  }
}
```

It wraps the router in `main.tsx`:

```tsx
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

Two deliberate details made this genuinely robust:

1. **It's self-contained — zero imports from app code.** If the boundary itself depended on
   a module that crashed, the safety net would go down with the thing it's supposed to
   catch. A safety net must not share fate with the trapeze.
2. **It offers a recovery action**, not just an apology. A "Reload EJOS" button gets the
   user back to a working state instead of stranding them.

This is the change I'm fondest of precisely *because* it does nothing in the happy path. It's
pure downside-protection — invisible right up until the day it saves the whole session.
Senior engineering is disproportionately about the failure paths nobody demos.

## Change 2: tests on the pure logic core — buying regression insurance

I didn't try to test everything. With limited time, the question is *where does a test buy
the most safety per line?* For EJOS the answer was unambiguous: the **pure logic cores** —
the modules with the most branching, the most subtle correctness, and the highest blast
radius if they silently break.

Two modules fit: the repository search/normalization engine (`cognitive/artifacts.ts`) and
the weekly pattern detector (`review/patterns.ts`). Both are pure functions — data in, data
out, no I/O — which makes them cheap and deterministic to test. I added **Vitest** with an
*isolated* config so the test runner never drags the PWA/Tailwind build pipeline into the
test environment:

```ts
// vitest.config.ts — node env, no DOM, @/ alias, completely separate from vite.config.ts
export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
```

The result is **15 tests covering the stuff most likely to break as data grows**: search
AND-matching across artifact types, newest-first sorting, Monday-anchored week math,
prior-week comparison logic, pattern detection edge cases (quiet weeks, open prediction
loops, single-lens overuse). One test even guards a *product invariant* — that every
detected pattern carries a qualitative tone (`neutral`/`attention`/`positive`) and **never a
numeric score.** The no-scores philosophy isn't just a guideline; there's a failing test
waiting if anyone violates it.

A detail worth stealing: I excluded `*.test.ts` from the production `tsc -b` build. Tests are
typechecked and run by Vitest; they're never shipped in the bundle. Test infrastructure
should harden your app without bloating it.

## Change 3: a real PWA icon — finishing the install story

The least glamorous, genuinely necessary one. The web manifest's `icons` array was empty,
which means the app couldn't be cleanly *installed* as a PWA — the whole point of the
offline-first promise. I added a scalable `icon.svg` and wired it in:

```ts
icons: [{ src: 'icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' }]
```

A single SVG is crisp at every size and gets precached by the service worker, so the install
works offline too. Not clever — just *finished*. Part of being production-ready is closing
the boring last 5% that the demo never exercised.

## How I knew it was actually done

I refused to let "done" be a feeling. The hardening pass had a verifiable checklist, and I
ran it:

- `npm test` → **15 tests, all green.**
- `npm run build` → clean strict-TypeScript build, **58 modules.**
- Service worker precache → **7 entries / ~447 KiB** (full offline shell).
- `npm run preview` → **HTTP 200**, and `/icon.svg` served as `image/svg+xml`.

Every item is a fact, not an impression. That's the difference between "I think it's stable"
and "here's the evidence it's stable."

## The meta-lesson

Hardening is a different *mode* of engineering than building, and knowing when to switch is
itself a judgment call. Building is about the happy path and new capability. Hardening is
about the failure paths, the regressions, and the unglamorous finish — and it's where a lot
of the actual seniority lives.

The three changes weren't picked at random. They were ranked by leverage: **crash safety
first** (biggest blast radius), **regression insurance second** (protects correctness as the
app grows), **install polish third** (completes the core promise). Same instinct you'd bring
to triaging a real production system.

Feature-complete is a starting line dressed up as a finish line. The hardening pass is what
turns "it works" into "it holds up."

---

*This was the final pass on EJOS before locking v1 — an offline-first PWA for training
engineering judgment. The whole series, from the product thesis to the architecture to the
process, is written up in the repo. I'd love your take on what else you'd harden first.*
