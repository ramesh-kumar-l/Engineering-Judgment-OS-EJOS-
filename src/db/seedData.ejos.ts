// Golden Example #1 — "Using EJOS on itself": the worked thinking behind building
// EJOS, recorded as EJOS artifacts. All ids are deterministic (`ex-ejos-*`) and all
// titles carry an "[Example]" marker so this demo data is labeled and removable.
// Dated into the week of 2026-06-08 so the Weekly Review surfaces real patterns.
import type {
  Session,
  Problem,
  Decision,
  SystemMap,
  Experiment,
  Review,
  Connection,
} from '@/domain/types';

// Local-time epoch ms for a given day/hour (matches the week-bucketing in review/patterns.ts).
const at = (date: string, hour: number): number =>
  new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`).getTime();

const SESSION_ID = 'ex-ejos-session';

const sessions: Session[] = [
  {
    id: SESSION_ID,
    date: '2026-06-08',
    problemStatement:
      '[Example] How do you build a tool that trains engineering judgment without faking it with scores?',
    createdAt: at('2026-06-08', 9),
    updatedAt: at('2026-06-08', 9),
  },
];

const problems: Problem[] = [
  {
    id: 'ex-ejos-problem',
    sessionId: SESSION_ID,
    title: '[Example] Framing: a "gym" for engineering judgment',
    statement:
      "Senior engineering is mostly judgment — framing problems, weighing tradeoffs, seeing second-order effects — yet there's no deliberate-practice tool for it. Courses teach facts; judgment is absorbed by accident over years. Can a fast daily tool make that practice deliberate without turning thinking into a vanity metric?",
    assumptions: [
      'Judgment improves with deliberate, reflective practice — not just years of exposure',
      'Engineers will only return daily if the tool is instant and works offline',
      'A numeric "judgment score" would corrupt the practice (Goodhart’s Law)',
      'A single private workspace is enough for v1 — no collaboration needed',
    ],
    stakeholders: [
      'The practicing engineer (primary user)',
      'Their future self, reviewing past decisions',
      'An optional AI coach',
      'Hiring managers who may read the artifacts later',
    ],
    rootCauseNotes:
      "Why is judgment hard to teach? → It's tacit and context-dependent. → Why does it take years? → The feedback loop between a decision and its outcome is months long and rarely revisited. Root cause: the decision→outcome loop is almost never deliberately closed. EJOS's real job is to shorten and close that loop.",
    createdAt: at('2026-06-08', 10),
    updatedAt: at('2026-06-08', 10),
  },
];

const systemMaps: SystemMap[] = [
  {
    id: 'ex-ejos-map',
    sessionId: SESSION_ID,
    title: '[Example] The judgment practice loop',
    description:
      'What actually makes judgment compound? Mapping the loop between daily practice, recorded decisions, and reviewed outcomes — and the friction that can stall it.',
    nodes: [
      { id: 'n1', label: 'Daily thinking practice' },
      { id: 'n2', label: 'Recorded decisions & predictions' },
      { id: 'n3', label: 'Reviewed outcomes (closed loops)' },
      { id: 'n4', label: 'Calibrated judgment' },
      { id: 'n5', label: 'Friction (load time, network dependence)' },
      { id: 'n6', label: 'Trust / daily return' },
    ],
    connections: [
      { id: 'e1', fromId: 'n1', toId: 'n2', polarity: 'reinforcing', note: 'practice produces recorded decisions' },
      { id: 'e2', fromId: 'n2', toId: 'n3', polarity: 'reinforcing', note: 'more records → more outcomes to review' },
      { id: 'e3', fromId: 'n3', toId: 'n4', polarity: 'reinforcing', note: 'closed loops calibrate judgment' },
      { id: 'e4', fromId: 'n4', toId: 'n1', polarity: 'reinforcing', note: 'better judgment makes practice rewarding → more practice' },
      { id: 'e5', fromId: 'n5', toId: 'n6', polarity: 'balancing', note: 'friction erodes trust and the urge to return' },
      { id: 'e6', fromId: 'n6', toId: 'n1', polarity: 'reinforcing', note: 'trust drives the daily return that feeds practice' },
    ],
    feedbackLoops: [
      'Reinforcing core loop: practice → records → reviewed outcomes → calibrated judgment → more practice',
      'Balancing loop: friction (slow load, network dependence) → lower trust → fewer return visits → the core loop stalls',
    ],
    leveragePoints: [
      'Make "closing the loop" (recording the actual outcome) effortless — it is the link humans always skip',
      'Drive friction toward zero (offline-first, instant load) so the daily-return loop never stalls',
    ],
    reflection:
      "The map made the priority obvious: the reinforcing loop only compounds if outcomes actually get reviewed — and that's the step everyone skips. So the product has to gently surface unclosed predictions, and never let network friction break the daily habit. Both findings pointed straight at offline-first plus a weekly review that flags open prediction loops.",
    createdAt: at('2026-06-09', 10),
    updatedAt: at('2026-06-09', 10),
  },
];

const decisions: Decision[] = [
  {
    id: 'ex-ejos-dec-stack',
    sessionId: SESSION_ID,
    title: '[Example] Decision: local-first PWA over native or Electron',
    context:
      'Need a cross-device, premium-feeling, offline tool with zero backend to stand up as a solo builder. What platform?',
    options: [
      'Native mobile app',
      'Electron desktop app',
      'Local-first PWA (Vite + React + IndexedDB + Service Worker)',
      'Classic React + REST + Postgres',
    ],
    chosenOption: 'Local-first PWA with IndexedDB as the source of truth',
    reasoning:
      'REST + Postgres makes the network mandatory — fatal for a "think on a plane" tool. Electron ships a 100MB+ runtime just to render forms. Native means two codebases and an app-store gate. A PWA is static-deployable, installable, offline via a Service Worker, and lets the browser be the backend. The trade I am consciously accepting: no multi-device sync in v1, and client-side secrets.',
    confidence: 'high',
    expectedOutcome:
      'Core workflows run fully offline; I ship six phases with no backend; the main regret will be the absence of sync.',
    actualOutcome:
      'Held up. Six phases shipped with no server. The hardest distributed-systems problem — client/server sync — was designed out entirely. Sync is the single most-wished-for gap, exactly as predicted.',
    status: 'reviewed',
    createdAt: at('2026-06-09', 14),
    updatedAt: at('2026-06-13', 11),
  },
  {
    id: 'ex-ejos-dec-scores',
    sessionId: SESSION_ID,
    title: '[Example] Decision: the coach asks questions, never grades',
    context:
      "Users instinctively want a number ('judgment: 7/10') — it feels like progress. Should the AI coach score the work?",
    options: ['Score each artifact 1–10', 'Letter grades against a rubric', 'No scores — only questions that surface blind spots'],
    chosenOption: 'No scores — the coach only asks sharper questions',
    reasoning:
      'The moment you score judgment, the user optimizes for the score, not the judgment (Goodhart’s Law). They start writing framings that look rigorous to please the grader instead of being honest, and the product erodes the exact skill it exists to build. Here, restraint is the feature.',
    confidence: 'high',
    expectedOutcome:
      'Users may miss the number at first, but reflection stays honest, and "no numeric score" becomes a defensible product identity.',
    actualOutcome:
      'Encoded the rule in the system prompt and guarded it with a unit test — every detected pattern must carry a qualitative tone, never a number. The constraint clarified every downstream prompt decision.',
    status: 'reviewed',
    createdAt: at('2026-06-10', 11),
    updatedAt: at('2026-06-13', 12),
  },
  {
    id: 'ex-ejos-dec-storage',
    sessionId: SESSION_ID,
    title: '[Example] Decision: IndexedDB is the source of truth, not a cache',
    context:
      'Local-first means inverting the usual model. Is the on-device database canonical, or just a cache of a future server?',
    options: [
      'Treat the local store as a cache of an eventual server',
      'Treat IndexedDB (via Dexie) as the canonical source of truth',
    ],
    chosenOption: 'IndexedDB via Dexie is canonical; sync (if ever) becomes additive and forward-only',
    reasoning:
      'If local is "just a cache," every feature inherits cache-invalidation and optimistic-update complexity from day one. Making local canonical removes loading states for the user’s own data and defers sync until it is actually needed — as an additive feature, never a prerequisite.',
    confidence: 'medium',
    expectedOutcome:
      'Migrations stay forward-only and I can never casually reset a user’s DB; if I later add end-to-end-encrypted sync, it should layer on without a rewrite.',
    actualOutcome: '',
    status: 'open',
    createdAt: at('2026-06-11', 10),
    updatedAt: at('2026-06-11', 10),
  },
];

const experiments: Experiment[] = [
  {
    id: 'ex-ejos-exp',
    sessionId: SESSION_ID,
    title: "[Example] First-principles: must an 'AI feature' mean 'send data to a server'?",
    technique: 'first-principles',
    subject: 'The assumption that adding an AI coach breaks the offline-first promise',
    assumptionChallenges: [
      {
        id: 'a1',
        assumption: 'AI requires a cloud API',
        challenge: 'Local models (Ollama) now run capable models on-device — the cloud API is one implementation, not the essence of "AI".',
      },
    ],
    fundamentals: [
      "Coaching = transform an artifact's text into sharper questions",
      'That transform needs a model and a prompt — not necessarily a network',
      'The app already treats the network as optional',
    ],
    reconstruction:
      'Define one LLMProvider interface the app owns. Cloud (Claude/Gemini) and local (Ollama) are merely implementations behind it. Offline-first survives because the local provider needs no network; online becomes a strict upgrade, never a dependency.',
    constraintsToDrop: [],
    reimagined: '',
    insight:
      "The vendor is an implementation detail behind an interface I own. 'AI' and 'offline-first' stop being in tension once you separate the capability (asking questions) from the delivery (the network). This became the Strategy-pattern provider layer.",
    createdAt: at('2026-06-12', 10),
    updatedAt: at('2026-06-12', 10),
  },
];

const reviews: Review[] = [
  {
    id: '2026-06-08',
    rangeStart: '2026-06-08',
    rangeEnd: '2026-06-15',
    notes:
      '[Example] Week of framing EJOS itself. The system map was the turning point — it showed the reinforcing loop only compounds if outcomes actually get reviewed, which is the step everyone skips. Three decisions recorded; the storage one is still an open prediction.',
    insight:
      'Carry forward: build the weekly review so it nags on open prediction loops — that is where judgment compounds. And protect the daily-return loop by refusing any network dependency in core flows.',
    createdAt: at('2026-06-14', 17),
    updatedAt: at('2026-06-14', 17),
  },
];

const connections: Connection[] = [
  { id: 'ex-ejos-conn-1', fromKind: 'problem', fromId: 'ex-ejos-problem', toKind: 'systemMap', toId: 'ex-ejos-map', note: 'the map explores the loop this framing named', createdAt: at('2026-06-12', 12) },
  { id: 'ex-ejos-conn-2', fromKind: 'problem', fromId: 'ex-ejos-problem', toKind: 'decision', toId: 'ex-ejos-dec-scores', note: "the 'no score' decision tests the framing's core assumption (Goodhart)", createdAt: at('2026-06-12', 12) },
  { id: 'ex-ejos-conn-3', fromKind: 'systemMap', fromId: 'ex-ejos-map', toKind: 'decision', toId: 'ex-ejos-dec-storage', note: "the leverage point 'kill friction' drove the local-first storage call", createdAt: at('2026-06-12', 13) },
  { id: 'ex-ejos-conn-4', fromKind: 'decision', fromId: 'ex-ejos-dec-stack', toKind: 'experiment', toId: 'ex-ejos-exp', note: 'the offline-first stack made the local-AI experiment necessary', createdAt: at('2026-06-12', 13) },
  { id: 'ex-ejos-conn-5', fromKind: 'decision', fromId: 'ex-ejos-dec-storage', toKind: 'review', toId: '2026-06-08', note: 'this open prediction loop is the one the review flags', createdAt: at('2026-06-14', 18) },
];

export const ejosExample = {
  sessions,
  problems,
  decisions,
  systemMaps,
  experiments,
  reviews,
  connections,
};
