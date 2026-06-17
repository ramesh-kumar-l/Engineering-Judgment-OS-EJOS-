// Domain model for EJOS. Pure types — no I/O, no storage concerns.
// See project-memory-bank/05-domain-model.md

export type ISODate = string; // 'YYYY-MM-DD'
export type Timestamp = number; // epoch ms

/** A daily thinking session. The center of the experience. */
export interface Session {
  id: string;
  date: ISODate; // one primary session per calendar day
  problemStatement: string; // answer to "What problem are you thinking about today?"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Problem Framing artifact. Outputs: assumptions, stakeholders, root-cause notes. */
export interface Problem {
  id: string;
  sessionId?: string; // optional link to the day's session
  title: string;
  statement: string;
  assumptions: string[];
  stakeholders: string[];
  rootCauseNotes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type Confidence = 'low' | 'medium' | 'high';
export type DecisionStatus = 'open' | 'reviewed';

/** Decision Record. Reasoning + confidence now; outcome reviewed later. */
export interface Decision {
  id: string;
  sessionId?: string;
  title: string;
  context: string;
  options: string[];
  chosenOption: string;
  reasoning: string;
  confidence: Confidence;
  expectedOutcome: string;
  // Filled in during a later outcome review (Phase 1 captures the fields; review UI lands later).
  actualOutcome: string;
  status: DecisionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Phase 2: Systems Thinking ----

/** How one part of the system affects another. No numeric weights (design rule). */
export type Polarity = 'reinforcing' | 'balancing';

/** A part of the system (a variable, actor, component, or force). */
export interface SystemNode {
  id: string;
  label: string;
}

/** A directed causal link: `fromId` affects `toId`. */
export interface SystemConnection {
  id: string;
  fromId: string;
  toId: string;
  polarity: Polarity; // reinforcing (amplifies) | balancing (stabilizes)
  note: string; // how / why this link exists
}

/** A System Map artifact — the Phase 2 thinking output. */
export interface SystemMap {
  id: string;
  sessionId?: string; // optional link to the day's session
  title: string;
  description: string; // what system are you looking at, and why?
  nodes: SystemNode[];
  connections: SystemConnection[];
  feedbackLoops: string[]; // reinforcing/balancing loops you've spotted
  leveragePoints: string[]; // where a small change yields a large effect
  reflection: string; // what the map revealed: second-order effects, surprises
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Phase 4: Innovation Lab ----

/** Which lens an experiment is run through. */
export type LabTechnique = 'assumptions' | 'first-principles' | 'redesign';

/** A belief taken for granted, paired with the move that questions it. */
export interface AssumptionChallenge {
  id: string;
  assumption: string; // the thing currently treated as fixed/true
  challenge: string; // what if it's false? what breaks, what opens up?
}

/** An Innovation Lab experiment — the Phase 4 thinking output. */
export interface Experiment {
  id: string;
  sessionId?: string; // optional link to the day's session
  title: string;
  technique: LabTechnique; // the primary lens; the editor focuses its section
  subject: string; // what are you reimagining? the thing under examination

  // Lens: assumption challenges
  assumptionChallenges: AssumptionChallenge[];

  // Lens: first-principles
  fundamentals: string[]; // the irreducible truths that must actually hold
  reconstruction: string; // rebuild from those truths, ignoring convention

  // Lens: redesign
  constraintsToDrop: string[]; // "sacred" constraints worth questioning
  reimagined: string; // the bolder alternative if those constraints fell

  insight: string; // what shifted? the breakthrough or the next bet
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Phase 5: Weekly Review ----

/** A weekly reflection. One row per week (id = the week's start date). The
 *  patterns themselves are recomputed live from artifacts; this stores the
 *  founder's durable reflection — the growth-tracking record over time. */
export interface Review {
  id: string; // = rangeStart (one review per week)
  rangeStart: ISODate; // inclusive — Monday of the week
  rangeEnd: ISODate; // exclusive — the next Monday
  notes: string; // what stood out this week
  insight: string; // what I'm carrying into next week
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ---- Phase 6: Cognitive Repository ----

/** Which kind of artifact a reference or connection points at. */
export type ArtifactKind =
  | 'session'
  | 'problem'
  | 'decision'
  | 'systemMap'
  | 'experiment'
  | 'review';

/** A manual, undirected link the founder draws between two artifacts — the
 *  edges of the thinking graph. The repository never invents these; the founder
 *  decides what relates to what. */
export interface Connection {
  id: string;
  fromKind: ArtifactKind;
  fromId: string;
  toKind: ArtifactKind;
  toId: string;
  note: string; // why these relate
  createdAt: Timestamp;
}

// ---- Phase 3: AI Coach ----

/** The latest coaching note generated for one artifact (one row per artifact). */
export interface Coaching {
  id: string; // = the coached artifact's id
  targetKind: 'problem' | 'decision' | 'systemMap' | 'experiment' | 'review';
  content: string; // the coach's response (markdown-ish text)
  provider: string; // which provider produced it (claude | gemini | ollama)
  model: string;
  createdAt: Timestamp;
}

export const todayISO = (): ISODate => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const newId = (): string => crypto.randomUUID();
