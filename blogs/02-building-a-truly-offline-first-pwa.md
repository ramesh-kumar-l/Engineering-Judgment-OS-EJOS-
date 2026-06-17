---
title: "Building a Truly Offline-First PWA: Local-First Architecture in Practice"
subtitle: "What I learned treating IndexedDB as the source of truth, Service Workers as the app server, and the network as optional."
tags: [pwa, offline-first, architecture, indexeddb, typescript, react]
canonical_platforms: [Medium, LinkedIn]
reading_time: 9 min
---

# Building a Truly Offline-First PWA: Local-First Architecture in Practice

Most apps that call themselves "offline-capable" are lying a little. They cache a few assets
so the page loads, then the first thing they do is fail to reach an API and show you a sad
spinner. Offline is a *degraded* mode bolted onto an online-first app.

I wanted the opposite. For **EJOS** (Engineering Judgment OS — a tool for daily thinking
practice), offline isn't a fallback. It's the *default*, and the network is the optional
extra. The persona I built for thinks while commuting, on a plane, in a focus block with
Wi-Fi off. If the app needs a server to let you frame a problem, the product is dead.

That single constraint — **the network is optional** — turned out to dictate the entire
architecture. Here's how it played out.

## The decision: local-first PWA, no backend on day one

I considered the obvious paths: a classic React + REST + Postgres app, an Electron desktop
app, a native app. Each fails the constraint or adds enormous friction. A REST backend makes
the network mandatory. Electron is a 100MB+ download to render a form.

The choice that actually satisfied "offline-first, cross-device, premium feel, zero backend
to stand up" was a **local-first Progressive Web App**:

| Layer | Choice | Why |
|-------|--------|-----|
| Language | **TypeScript** (strict) | Type safety across a long-lived personal product. |
| Build / UI | **Vite + React (SPA)** | Fast, static-deployable; no server needed. |
| Styling | **Tailwind CSS** | Precise control for a calm, Linear/Vercel-grade UI. |
| Local store | **IndexedDB via Dexie** | Durable, structured, on-device source of truth. |
| Offline shell | **Service Worker** (Vite PWA plugin / Workbox) | App loads & runs with no network. |
| AI (optional) | **Pluggable LLM** (Claude/Gemini online, Ollama offline) | Additive layer, never blocks core work. |

The key mental shift: **there is no "backend." The user's browser *is* the backend.**
IndexedDB is the database. The Service Worker is the static file server. The domain logic
runs on the client. Nothing waits on a round trip.

## Principle 1: IndexedDB is the source of truth, not a cache

In an online-first app, local storage is a *cache* — a convenience copy of the real data
that lives on a server. The instant the network returns, the server wins.

In a local-first app you invert that. The on-device database **is** the canonical data.
There is no server copy to reconcile with. This is liberating and clarifying:

- Every write is synchronous-feeling and never depends on connectivity.
- There's no loading state for your own data, no optimistic-update rollback dance, no
  cache-invalidation tax.
- The hardest distributed-systems problem in most apps — keeping client and server in sync —
  simply doesn't exist in v1.

I use **Dexie** over raw IndexedDB because raw IndexedDB has an API only its mother could
love. Dexie gives me a clean, promise-based, typed layer and — critically — **versioned
migrations**:

```ts
// db/database.ts — schema evolves across versions; Dexie migrates on upgrade.
db.version(1).stores({ sessions: 'id, date', problems: 'id, createdAt', decisions: 'id, createdAt' });
db.version(2).stores({ systemMaps: 'id, createdAt' });
// ... v3 added settings + coachings, v4 experiments, v5 reviews, v6 connections.
```

This is the same migration discipline you'd apply to a Postgres schema — it just runs in the
browser. By v6, EJOS had six entity types and not one migration broke an existing user's
data, because each version is additive and forward-only.

## Principle 2: the Service Worker makes the shell network-independent

A PWA's Service Worker can precache the app shell so it loads with no network. With the Vite
PWA plugin I precache everything the app needs to boot:

```ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
})
```

`autoUpdate` means new deploys roll in transparently. The result: open the installed app on
a plane and it loads instantly — HTML, JS, CSS, fonts, icon, all served from the local
cache. Combined with IndexedDB holding the data, **the entire core product functions with
the radio off.**

## Principle 3: layer so that purity is testable and the network is quarantined

Offline-first rewards a clean dependency direction. EJOS layers like this:

```
React screens
   ↓ (call)
repository  ──────────►  IndexedDB (Dexie)        ← the ONLY owner of persistence
   ↑ (typed)
domain/types.ts (pure)                            ← no I/O, no storage concerns
cognitive/, review/ (pure logic)                  ← search, week-math, pattern detection
```

Two rules fall out of this and they matter more than they look:

1. **One module owns persistence.** Only `repository.ts` touches Dexie. Screens never reach
   into the database directly. Swap the storage engine and exactly one file changes.

2. **Pure logic has zero dependencies on I/O.** The search engine
   (`cognitive/artifacts.ts`) and the weekly pattern detector (`review/patterns.ts`) are
   pure functions: data in, data out. That means I can unit-test the brain of the app
   *without* a browser, a DOM, or a database. My Vitest config literally runs in a `node`
   environment with no DOM, and the tests are fast and deterministic.

The same principle quarantines the network. The optional AI Coach is the *only* thing that
touches the network, and it sits behind a single `LLMProvider` interface (more on that in
the next post). Core workflows can't accidentally grow a network dependency, because the
network lives in one isolated corner of the codebase.

## Principle 4: reactive UI without a state-management circus

Because IndexedDB is the source of truth, I wanted the UI to *react* to the database rather
than manually shuttle data around. `dexie-react-hooks` gives me `useLiveQuery`:

```ts
const decisions = useLiveQuery(() => db.decisions.orderBy('createdAt').reverse().toArray());
```

When the underlying data changes, the component re-renders. No global store, no manual
cache, no event bus. The database *is* the state. (I have Zustand installed for future
cross-screen UI state, but I deliberately haven't reached for it — you don't add a state
library to solve a problem you don't have yet.)

## What offline-first costs you (the honest part)

It's not free:

- **No sync, no multi-device in v1.** Your data lives in one browser profile on one device.
  That's an accepted trade-off, not an oversight — sync is a *future, additive* feature
  (e.g. end-to-end encrypted), never a requirement for daily use.
- **Client-side secrets.** With no backend, online AI API keys are stored and used in the
  browser. For a single-device personal tool that's acceptable; for a multi-user product it
  wouldn't be. Knowing *which* trade-offs you're making — and writing them down — is the
  job.
- **Migrations are forever.** You can't reset a user's local DB on a whim. Every schema
  change has to be forward-compatible. That discipline is good for you.

## The payoff

The result is an app with no server bill, no cold starts, no API latency, instant writes,
full functionality with the network off, and a clean enough architecture that I could ship
six feature phases without the codebase fighting back. The hardest distributed-systems
problems were *designed out* rather than solved.

Offline-first isn't a feature you add. It's a constraint you accept early — and it pays you
back in simplicity every single day after.

In the next post: the pluggable AI layer that lets the same coaching code talk to Claude,
Gemini, or a local Ollama model — and refuses, by design, to ever score you.

---

*EJOS is a local-first PWA built with TypeScript, React, Vite, Dexie, and a Service Worker.
The full architecture lives in the project's memory bank. Questions about local-first design?
I'll answer every reply.*
