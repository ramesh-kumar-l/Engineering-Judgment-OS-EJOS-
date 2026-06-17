# Engineering Judgment OS (EJOS) — Quick Starter Guide

> **New here? Start at the top and read straight down.** This single document answers
> every question a first-time engineer will have: what this is, why it exists, how to
> run it, how it's built, how to use it, and where to look when something breaks.

---

## 1. What is EJOS, in one paragraph?

**EJOS is an offline-first Progressive Web App (PWA) that trains engineering *judgment* —
the cognitive skill that separates senior, staff, and principal engineers from everyone
else.** Technical skill is teachable and abundant; judgment usually accretes slowly and
accidentally through years of consequences. EJOS is the *gym* for it: a calm, private,
local-first workspace where you do short daily reps — framing problems, mapping systems,
recording decisions with your confidence, and reviewing what actually happened. An
optional AI Coach asks you sharper questions, but **it never grades or scores you.**

**Tagline:** *"The Personal Operating System for Developing Engineering Judgment."*

---

## 2. Why does it exist? (The problem)

| The gap | What EJOS does about it |
|---------|-------------------------|
| There's no structured, daily place to *practice* thinking. | A daily "thinking session" is the home screen and the core of the product. |
| Reflection is ad hoc and forgotten. | Every artifact persists locally, forever, building a durable judgment journal. |
| Decisions are made and never reviewed against reality. | The Decision Journal captures reasoning + confidence now, and the actual outcome later. |
| Mental models stay implicit and fragile. | System Maps externalize cause-and-effect so you can interrogate them. |
| Learning tools require an account, a network, and trust in a vendor. | 100% offline, no account, no server. Your data never leaves your device. |

Every feature must answer one question: **"What cognitive skill does this improve?"**
If it can't, it's cut.

### What EJOS is *not*
- Not a tutorial platform for languages/frameworks.
- Not a grading/scoring engine. There is **no "76/100"** anywhere in the product.
- Not a habit-streak gamification toy or an analytics dashboard you stare at.

---

## 3. The five skills it trains

1. **Problem Framing** — surface assumptions, stakeholders, and root causes *before* jumping to solutions.
2. **Systems Thinking** — map parts, causal links, feedback loops, and leverage points.
3. **Decision Making** — record options, reasoning, confidence, and the expected vs. actual outcome.
4. **Innovation Thinking** — challenge assumptions, reason from first principles, redesign.
5. **Pattern Recognition** — weekly review that reflects your thinking back to you.

---

## 4. Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | 20+ (LTS) recommended | Runs Vite, the build, and the tests. |
| **npm** | ships with Node | Package manager (the repo uses `package-lock`-style npm). |
| A modern browser | Chrome/Edge/Firefox/Safari | The app is a PWA; IndexedDB + Service Workers required. |
| *(optional)* **Ollama** | latest | Only if you want the AI Coach to work **offline**. See §9. |
| *(optional)* a Claude or Gemini API key | — | Only if you want the **online** AI Coach. See §9. |

You do **not** need a backend, a database server, Docker, or any cloud account to run EJOS.

---

## 5. Install & run (the 60-second version)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (hot reload)
npm run dev
# → open the printed http://localhost:5173

# 3. Run the tests
npm test

# 4. Build for production
npm run build

# 5. Preview the production build locally
npm run preview
```

### What each script does

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `vite` | Local dev server with hot module replacement. |
| `npm run build` | `tsc -b && vite build` | Strict TypeScript typecheck **then** the production bundle (incl. the PWA service worker). |
| `npm run preview` | `vite preview` | Serves the built `dist/` exactly as it would ship. |
| `npm run typecheck` | `tsc -b --noEmit` | Types only, no emit. |
| `npm test` | `vitest run` | Runs the unit test suite once (CI-style). |

> **Windows / PowerShell note:** if you script the preview server, invoke `npm.cmd`
> (not bare `npm`) so the process resolves correctly.

---

## 6. Project structure (where things live)

The codebase follows a strict rule: **every file stays under ~300 lines.** Big files are
split by responsibility so you (or an AI tool) only ever read the 100 lines you need.

```
EJOS/
├─ public/
│  └─ icon.svg                 # scalable PWA install icon
├─ src/
│  ├─ main.tsx                 # entry: router + top-level <ErrorBoundary>
│  ├─ index.css                # Tailwind + design tokens (CSS variables)
│  ├─ domain/
│  │  └─ types.ts              # PURE domain model — no I/O, no storage
│  ├─ db/
│  │  ├─ database.ts           # Dexie schema + v1–v6 migrations
│  │  └─ repository.ts         # the ONLY place that owns persistence
│  ├─ ai/                      # pluggable AI Coach layer
│  │  ├─ types.ts              # LLMProvider interface + AISettings
│  │  ├─ providers/            # claude.ts · gemini.ts · ollama.ts · index.ts
│  │  ├─ prompts.ts            # coach system + per-artifact prompts (never grades)
│  │  └─ coach.ts              # runCoaching() orchestration
│  ├─ cognitive/               # Phase 6 — Cognitive Repository
│  │  ├─ artifacts.ts          # PURE search/normalization core (tested)
│  │  ├─ SearchResults.tsx · ThinkingGraph.tsx · ConnectionsEditor.tsx
│  │  └─ artifacts.test.ts     # 7 unit tests
│  ├─ review/                  # Phase 5 — Weekly Review
│  │  ├─ patterns.ts           # PURE pattern detection (tested, no scores)
│  │  ├─ PatternList.tsx
│  │  └─ patterns.test.ts      # 8 unit tests
│  ├─ screens/                 # one screen per route (see §7)
│  └─ components/
│     ├─ AppShell.tsx          # sidebar nav + <Outlet>
│     ├─ ErrorBoundary.tsx     # top-level crash safety net
│     ├─ CoachPanel.tsx        # reusable AI Coach panel
│     ├─ OfflineBadge.tsx · ui.tsx
├─ project-memory-bank/        # the project's documentation + "save state"
├─ vite.config.ts              # Vite + React + Tailwind + PWA plugin
├─ vitest.config.ts            # isolated test config (node env, @/ alias)
└─ tsconfig*.json              # strict TS; tests excluded from the prod build
```

**Layering rule (read this once and it all makes sense):**

```
React screens  →  repository (Dexie)  →  IndexedDB   (source of truth)
        ↑ pure domain types ↑                ↑ pure logic (cognitive/, review/)
UI never calls an AI vendor directly — only through the LLMProvider interface.
```

The path alias **`@/` maps to `src/`** (configured in `vite.config.ts`,
`tsconfig.app.json`, and `vitest.config.ts`), so imports look like
`import { db } from '@/db/repository'`.

---

## 7. The screens / routes

| Route | Screen | What you do there |
|-------|--------|-------------------|
| `/` | **Today** | The daily thinking session. *"What problem are you thinking about today?"* Auto-saves. |
| `/framing` | **Problem Framing** | Capture assumptions, stakeholders, root-cause notes. |
| `/systems` | **Systems Thinking** | Build System Maps: parts, causal links (reinforcing/balancing), loops, leverage points. |
| `/decisions` | **Decision Journal** | Record options, choice, reasoning, confidence (low/med/high), expected vs. actual outcome. |
| `/lab` | **Innovation Lab** | Three lenses: challenge assumptions · first principles · redesign. |
| `/review` | **Weekly Review** | Locally-computed patterns across your week + a reflection. |
| `/repository` | **Cognitive Repository** | Full-text search across everything; draw connections; see your thinking graph. |
| `/settings` | **Settings** | Pick your AI provider, keys/models, Ollama URL, "Test connection". |

---

## 8. Core concepts & the data model

Everything you create is a typed **artifact** persisted to IndexedDB. The domain types
live in `src/domain/types.ts` (pure TypeScript, no storage concerns):

- **Session** — one primary thinking session per calendar day.
- **Problem** — a framing artifact (assumptions, stakeholders, root cause).
- **Decision** — options, chosen option, reasoning, `confidence: low|medium|high`, expected & actual outcome, `status: open|reviewed`.
- **SystemMap** — `nodes`, `connections` (each with a `polarity`: *reinforcing* | *balancing*, **no numeric weights**), feedback loops, leverage points, reflection.
- **Experiment** — an Innovation Lab artifact with one of three `technique` lenses.
- **Review** — one row per week (id = the week's Monday), holding your durable reflection.
- **Connection** — a manual, undirected link *you* draw between any two artifacts (the edges of the thinking graph).
- **Coaching** — the latest AI note for one artifact (which provider/model produced it).

> **Design rule you'll see everywhere: no numeric scores.** Confidence is qualitative
> (low/med/high). The AI asks questions; it does not grade. This is intentional — the
> product builds judgment, it doesn't rank you.

### Where is my data stored?
In your browser's **IndexedDB**, managed by [Dexie](https://dexie.org/). It is the single
**source of truth**. There is no server and no sync in v1 — your thinking never leaves your
machine. The schema is versioned (`v1`–`v6`); Dexie runs migrations automatically when you
upgrade.

---

## 9. Setting up the AI Coach (optional)

The Coach is **additive** — every manual workflow works fully without it. It runs through a
single `LLMProvider` interface, so the app never depends on a specific vendor. Configure it
in **Settings (`/settings`)**.

### Option A — Online (Claude or Gemini)
1. Get an API key from Anthropic (Claude) or Google (Gemini).
2. In Settings, pick the provider, paste the key, choose a model, click **Test connection**.
3. The key is stored **locally in your browser** and called browser-direct.

> **Security note (R-002):** because EJOS has no backend, online keys are used client-side.
> This is an accepted trade-off for a single-device, local-first tool. Use a scoped key.

### Option B — Offline (Ollama) — *recommended for the offline-first experience*
1. Install [Ollama](https://ollama.com) and pull a model, e.g. `ollama pull qwen3`.
2. **Allow the browser to call Ollama (CORS).** Start Ollama with the browser origin allowed:
   ```bash
   # macOS/Linux
   OLLAMA_ORIGINS=http://localhost:5173 ollama serve
   ```
   ```powershell
   # Windows PowerShell
   $env:OLLAMA_ORIGINS="http://localhost:5173"; ollama serve
   ```
   *(This is risk **R-003**. If "Test connection" fails, this is almost always why.)*
3. In Settings, choose **Ollama**, set the URL (default `http://localhost:11434`), pick the model, **Test connection**.

The Coach surfaces blind spots and asks questions. It will never give you a grade.

---

## 10. Installing it as an app & using it offline

EJOS is a real PWA:
- After `npm run build` / `npm run preview` (or once deployed), your browser will offer
  **"Install"** — it gets its own window and the `icon.svg`.
- The app **shell and assets are precached** by the service worker, so it loads and runs
  with **no network**. All reads/writes go to local IndexedDB.
- Only the *online* AI providers need a network; everything else (and Ollama) works offline.

---

## 11. Testing

- Framework: **Vitest 3**, configured in its own `vitest.config.ts` (node environment, no
  DOM) so the production/PWA build pipeline is never pulled into tests.
- Coverage today is the **pure logic cores** — the highest-leverage, most regression-prone
  code:
  - `src/cognitive/artifacts.test.ts` — search AND-matching, newest-first sort, ref indexing, title fallbacks (7 tests).
  - `src/review/patterns.test.ts` — Monday-anchored week math, prior-week comparisons, pattern detection, and the *no-numeric-score* invariant (8 tests).
- Run them with `npm test` → **15 tests, all green.**
- Test files are excluded from `tsc -b`, so they're never shipped in the bundle.

---

## 12. Troubleshooting / FAQ

| Symptom | Likely cause & fix |
|---------|--------------------|
| Blank white screen | An unexpected render error — the top-level `ErrorBoundary` should show a recovery view with a **Reload** button. If not, check the browser console. |
| AI "Test connection" fails with Ollama | CORS. Restart Ollama with `OLLAMA_ORIGINS` set to your app's origin (§9, R-003). |
| AI "Test connection" fails with Claude/Gemini | Bad/missing key, wrong model name, or no network. Online providers require connectivity. |
| My data disappeared | IndexedDB is per-browser-profile and per-origin. Clearing site data / using a different browser or incognito starts fresh. There is no sync in v1. |
| Build fails on a `.test.ts` type error | Tests are excluded from `tsc -b`; run `npm test` to typecheck/run them in the Vitest pipeline. |
| Import `@/...` not resolving | The `@` alias must exist in `vite.config.ts`, `tsconfig.app.json`, **and** `vitest.config.ts`. |
| Changes don't appear after deploy | The service worker uses `autoUpdate`; hard-reload or close all tabs to pick up the new version. |

---

## 13. Conventions if you want to contribute

- **Files under ~300 lines.** Split by responsibility (e.g. one screen per file, one
  provider per file).
- **Keep the layering clean:** UI → repository → IndexedDB; pure logic in `domain/`,
  `cognitive/`, `review/`; AI only through `LLMProvider`.
- **Surgical changes:** touch only what the task needs; match the existing style; don't
  refactor working code without a reason.
- **No numeric scores. Ever.** It's a product invariant — there are tests guarding it.
- **The memory bank is the save-state.** Before ending a feature, update
  `project-memory-bank/current-state.md` and `13-build-log.md`.

---

## 14. Status & roadmap

**v1 is feature-complete.** Phases 0–6 are all implemented, plus a production-hardening pass:

| Phase | Feature | Status |
|-------|---------|--------|
| 0 | Foundation (vision, personas, architecture, design system) | ✅ |
| 1 | Core daily workflow (Session, Framing, Decisions) | ✅ |
| 2 | Systems Thinking (System Maps) | ✅ |
| 3 | AI Coach (Claude / Gemini / Ollama) | ✅ |
| 4 | Innovation Lab (3 lenses) | ✅ |
| 5 | Weekly Review (pattern detection) | ✅ |
| 6 | Cognitive Repository (search + thinking graph) | ✅ |
| — | Hardening (ErrorBoundary, Vitest suite, PWA icon) | ✅ |

**Known, intentional v1 limitations:** single-device (no sync/accounts); AI keys are
client-side for online providers; system-map layout is auto-generated (read-only);
coaching is not streamed; tests cover pure logic (UI/Dexie paths not yet tested).

---

*EJOS is offline-first, private by design, and built around one belief: judgment is a skill
you can train deliberately — not just one you wait to accumulate by accident.*
