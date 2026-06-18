// Golden Example #2 — "Designing an Android fitness tracker", recorded as the EJOS
// thinking an engineer would actually do before writing code. Deterministic ids
// (`ex-fit-*`) and an "[Example]" marker keep this demo data labeled and removable.
// Dated into the week of 2026-06-01 so the Weekly Review surfaces real patterns.
import type {
  Session,
  Problem,
  Decision,
  SystemMap,
  Experiment,
  Review,
  Connection,
} from '@/domain/types';

const at = (date: string, hour: number): number =>
  new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`).getTime();

const SESSION_ID = 'ex-fit-session';

const sessions: Session[] = [
  {
    id: SESSION_ID,
    date: '2026-06-01',
    problemStatement:
      '[Example] How do you design an Android fitness tracker people trust enough to keep wearing daily?',
    createdAt: at('2026-06-01', 9),
    updatedAt: at('2026-06-01', 9),
  },
];

const problems: Problem[] = [
  {
    id: 'ex-fit-problem',
    sessionId: SESSION_ID,
    title: '[Example] Framing: why fitness trackers get abandoned',
    statement:
      'Most fitness apps are downloaded, used for two weeks, and abandoned. The obvious technical problem — count steps, log workouts — is solved. The real problem is sustained trust and habit. What makes a user keep an Android tracker running after the novelty fades?',
    assumptions: [
      'Perceived consistency matters more to retention than raw accuracy',
      'Battery drain is the silent killer of any daily-wear app',
      "Users won't grant every permission up front",
      'Offline logging (gym basements, planes, trails) is a core requirement, not an edge case',
    ],
    stakeholders: [
      'The daily wearer',
      'Android OS (Doze, battery limits, runtime permissions, background caps)',
      'Sensor hardware (accelerometer, step counter, GPS, heart-rate)',
      'The user’s future self, looking at long-term trends',
    ],
    rootCauseNotes:
      'Why do people quit? → The app feels unreliable or eats their battery. → Why unreliable? → Background work gets killed by Doze and aggressive OEM battery managers, leaving silent data gaps that erode trust. Root cause: fighting the platform’s power model instead of designing with it.',
    createdAt: at('2026-06-01', 10),
    updatedAt: at('2026-06-01', 10),
  },
];

const systemMaps: SystemMap[] = [
  {
    id: 'ex-fit-map',
    sessionId: SESSION_ID,
    title: '[Example] The daily-wear trust loop',
    description:
      'What keeps a tracker on the wrist? Mapping how data reliability, battery, and habit reinforce — and limit — each other.',
    nodes: [
      { id: 'm1', label: 'Accurate, gap-free data' },
      { id: 'm2', label: 'User trust' },
      { id: 'm3', label: 'Daily wear / habit' },
      { id: 'm4', label: 'Background sensor sampling' },
      { id: 'm5', label: 'Battery drain' },
      { id: 'm6', label: 'OS background-kill (Doze / OEM)' },
    ],
    connections: [
      { id: 'f1', fromId: 'm4', toId: 'm1', polarity: 'reinforcing', note: 'sampling produces the data' },
      { id: 'f2', fromId: 'm1', toId: 'm2', polarity: 'reinforcing', note: 'gap-free data builds trust' },
      { id: 'f3', fromId: 'm2', toId: 'm3', polarity: 'reinforcing', note: 'trust drives daily wear' },
      { id: 'f4', fromId: 'm3', toId: 'm4', polarity: 'reinforcing', note: 'worn more → more sampling' },
      { id: 'f5', fromId: 'm4', toId: 'm5', polarity: 'reinforcing', note: 'more sampling → more battery drain' },
      { id: 'f6', fromId: 'm5', toId: 'm6', polarity: 'reinforcing', note: 'drain triggers OS background-kill' },
      { id: 'f7', fromId: 'm6', toId: 'm1', polarity: 'balancing', note: 'kills create data gaps — capping the value loop' },
    ],
    feedbackLoops: [
      'Reinforcing: wear → sampling → data → trust → more wear',
      'Balancing/limiting: sampling → battery drain → OS background-kill → data gaps → eroded trust (caps the reinforcing loop)',
    ],
    leveragePoints: [
      'Sampling strategy is THE leverage point — it sits on both loops at once: prefer low-power hardware step/motion sensors, batch reads, and defer with WorkManager to ride the OS power model instead of fighting it',
      'Make missing data visible and honest rather than silently faked — protects trust on the inevitable days gaps happen',
    ],
    reflection:
      'The map showed sampling frequency is the single variable that both creates value (data) and destroys it (battery → OS kills → gaps). So the architecture should orbit a smart, OS-cooperative sampling strategy, not a brute-force foreground service. That reframed the very first build decision.',
    createdAt: at('2026-06-02', 10),
    updatedAt: at('2026-06-02', 10),
  },
];

const decisions: Decision[] = [
  {
    id: 'ex-fit-dec-sensors',
    sessionId: SESSION_ID,
    title: '[Example] Decision: hardware step-counter + batched sensors over a foreground service',
    context:
      'Need continuous activity data without draining the battery or getting the process killed by the OS.',
    options: [
      'Persistent foreground service polling the accelerometer',
      'Hardware Step Counter / Significant Motion sensors + WorkManager batching',
      'Continuous GPS polling for distance',
    ],
    chosenOption: 'Hardware Step Counter + batched accelerometer reads, scheduled via WorkManager',
    reasoning:
      'The hardware step-counter runs on a low-power co-processor — it counts even while the app sleeps, at almost no battery cost. A foreground service is reliable but burns battery and nags the user with a permanent notification; continuous GPS is the worst offender. Cooperating with the OS power model beats fighting it.',
    confidence: 'medium',
    expectedOutcome:
      'Battery cost of step tracking becomes negligible; small gaps during deep Doze will need backfilling from the counter’s cumulative total.',
    actualOutcome:
      'The cumulative-counter design means gaps self-heal: even if sampling is skipped, the next read recovers total steps since boot. Battery impact measured negligible. The one trade was needing boot-event handling to reset the cumulative baseline.',
    status: 'reviewed',
    createdAt: at('2026-06-02', 15),
    updatedAt: at('2026-06-06', 11),
  },
  {
    id: 'ex-fit-dec-onboarding',
    sessionId: SESSION_ID,
    title: '[Example] Decision: ask permissions just-in-time, not up front',
    context:
      'Android requires runtime permissions (activity recognition, location, notifications). When do we ask for them?',
    options: [
      'Request all permissions on first launch',
      'Request each permission in context, when its feature is first used',
      'Engineer most features to work with zero permissions',
    ],
    chosenOption: 'Just-in-time, contextual requests with a graceful fallback when denied',
    reasoning:
      'A wall of permission dialogs on first launch is a top uninstall trigger. Asking for location only when the user starts a GPS run — with a one-line "why" — converts far better. Every feature degrades gracefully if its permission is denied.',
    confidence: 'low',
    expectedOutcome:
      'Higher grant rate and lower first-session uninstall, at the cost of more engineering: every feature needs a denied-permission path.',
    actualOutcome: '',
    status: 'open',
    createdAt: at('2026-06-03', 11),
    updatedAt: at('2026-06-03', 11),
  },
  {
    id: 'ex-fit-dec-storage',
    sessionId: SESSION_ID,
    title: '[Example] Decision: offline-first local store (Room) as the source of truth',
    context: 'Gyms, basements, planes, trails — no network. Where does logged data actually live?',
    options: [
      'Write straight to a cloud backend',
      'Room (SQLite) as the source of truth, sync opportunistically later',
      'SharedPreferences / flat files',
    ],
    chosenOption: 'Room as the on-device source of truth; cloud sync is a later, additive layer',
    reasoning:
      'A tracker that needs signal to log a workout is broken exactly where workouts happen. Room gives durable, queryable local storage; writes never wait on the network. Sync becomes an opportunistic background job, not a blocker. Same local-first principle EJOS itself follows.',
    confidence: 'high',
    expectedOutcome:
      'Every log succeeds offline; conflict resolution becomes the main future complexity once multi-device sync lands.',
    actualOutcome:
      'Logging is instant and network-independent. As predicted, the open question is conflict resolution once sync exists — and it deferred cleanly because the local store is canonical.',
    status: 'reviewed',
    createdAt: at('2026-06-04', 10),
    updatedAt: at('2026-06-06', 12),
  },
];

const experiments: Experiment[] = [
  {
    id: 'ex-fit-exp',
    sessionId: SESSION_ID,
    title: '[Example] Challenge assumptions: does a fitness tracker need a screen at all?',
    technique: 'assumptions',
    subject: 'The unspoken assumption that engagement requires an attention-grabbing app UI',
    assumptionChallenges: [
      {
        id: 'fa1',
        assumption: 'Users must open the app daily for it to be valuable',
        challenge: 'What if the best tracker is nearly invisible — captures passively, surfaces one insight a week, and never demands attention?',
      },
      {
        id: 'fa2',
        assumption: 'More metrics = more value',
        challenge: 'What if showing fewer, higher-trust numbers builds more lasting habit than a noisy dashboard of everything?',
      },
    ],
    fundamentals: [],
    reconstruction: '',
    constraintsToDrop: ['The app must be opened daily', 'The dashboard must show every available metric'],
    reimagined:
      'A "calm" tracker: passive capture all week, one honest weekly insight delivered as a notification (not a dashboard), and deliberately few metrics. Success measured by retention and trust, not daily-active opens.',
    insight:
      "Inverting 'engagement = daily opens' reframes the whole UX around trust and calm. Fewer, honest metrics beat a noisy dashboard for long-term wear — the same restraint EJOS applies by refusing to show scores.",
    createdAt: at('2026-06-05', 10),
    updatedAt: at('2026-06-05', 10),
  },
];

const reviews: Review[] = [
  {
    id: '2026-06-01',
    rangeStart: '2026-06-01',
    rangeEnd: '2026-06-08',
    notes:
      '[Example] Week of framing the fitness tracker. The system map exposed that sampling frequency sits on both the value loop and the battery-kill loop — so everything hinges on cooperating with Android’s power model. Two decisions reviewed; the onboarding prediction is still open.',
    insight:
      'Carry forward: design with Doze and WorkManager instead of against them, and ask permissions just-in-time. Treat battery as a first-class feature, not an afterthought.',
    createdAt: at('2026-06-07', 16),
    updatedAt: at('2026-06-07', 16),
  },
];

const connections: Connection[] = [
  { id: 'ex-fit-conn-1', fromKind: 'problem', fromId: 'ex-fit-problem', toKind: 'systemMap', toId: 'ex-fit-map', note: 'the map traces the trust/battery loop this framing named', createdAt: at('2026-06-05', 12) },
  { id: 'ex-fit-conn-2', fromKind: 'systemMap', fromId: 'ex-fit-map', toKind: 'decision', toId: 'ex-fit-dec-sensors', note: "the leverage point 'smart sampling' drove the sensor decision", createdAt: at('2026-06-05', 12) },
  { id: 'ex-fit-conn-3', fromKind: 'problem', fromId: 'ex-fit-problem', toKind: 'decision', toId: 'ex-fit-dec-onboarding', note: 'permission friction is part of the abandonment root cause', createdAt: at('2026-06-05', 13) },
  { id: 'ex-fit-conn-4', fromKind: 'decision', fromId: 'ex-fit-dec-storage', toKind: 'experiment', toId: 'ex-fit-exp', note: 'the offline-first store enables the calm, passive-capture tracker idea', createdAt: at('2026-06-05', 13) },
  { id: 'ex-fit-conn-5', fromKind: 'decision', fromId: 'ex-fit-dec-sensors', toKind: 'review', toId: '2026-06-01', note: 'the battery-cooperation insight is the week’s main takeaway', createdAt: at('2026-06-07', 17) },
];

export const fitnessExample = {
  sessions,
  problems,
  decisions,
  systemMaps,
  experiments,
  reviews,
  connections,
};
