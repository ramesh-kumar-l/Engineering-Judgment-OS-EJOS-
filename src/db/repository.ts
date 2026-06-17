// Repository: the only module that owns persistence. UI/domain go through here.
import { db } from './database';
import {
  type Session,
  type Problem,
  type Decision,
  type Confidence,
  type SystemMap,
  type Coaching,
  type Experiment,
  type Review,
  type Connection,
  type ArtifactKind,
  newId,
  todayISO,
} from '@/domain/types';
import { type AISettings, DEFAULT_AI_SETTINGS } from '@/ai/types';

const now = () => Date.now();

// ---- Sessions ----
export async function getOrCreateTodaySession(): Promise<Session> {
  const date = todayISO();
  const existing = await db.sessions.where('date').equals(date).first();
  if (existing) return existing;
  const session: Session = {
    id: newId(),
    date,
    problemStatement: '',
    createdAt: now(),
    updatedAt: now(),
  };
  await db.sessions.add(session);
  return session;
}

export async function updateSessionStatement(id: string, problemStatement: string): Promise<void> {
  await db.sessions.update(id, { problemStatement, updatedAt: now() });
}

// ---- Problems ----
export async function createProblem(sessionId?: string): Promise<string> {
  const id = newId();
  const problem: Problem = {
    id,
    sessionId,
    title: '',
    statement: '',
    assumptions: [],
    stakeholders: [],
    rootCauseNotes: '',
    createdAt: now(),
    updatedAt: now(),
  };
  await db.problems.add(problem);
  return id;
}

export async function saveProblem(problem: Problem): Promise<void> {
  await db.problems.put({ ...problem, updatedAt: now() });
}

export async function deleteProblem(id: string): Promise<void> {
  await db.problems.delete(id);
}

// ---- Decisions ----
export async function createDecision(sessionId?: string): Promise<string> {
  const id = newId();
  const decision: Decision = {
    id,
    sessionId,
    title: '',
    context: '',
    options: [],
    chosenOption: '',
    reasoning: '',
    confidence: 'medium' as Confidence,
    expectedOutcome: '',
    actualOutcome: '',
    status: 'open',
    createdAt: now(),
    updatedAt: now(),
  };
  await db.decisions.add(decision);
  return id;
}

export async function saveDecision(decision: Decision): Promise<void> {
  await db.decisions.put({ ...decision, updatedAt: now() });
}

export async function deleteDecision(id: string): Promise<void> {
  await db.decisions.delete(id);
}

// ---- System Maps (Phase 2) ----
export async function createSystemMap(sessionId?: string): Promise<string> {
  const id = newId();
  const map: SystemMap = {
    id,
    sessionId,
    title: '',
    description: '',
    nodes: [],
    connections: [],
    feedbackLoops: [],
    leveragePoints: [],
    reflection: '',
    createdAt: now(),
    updatedAt: now(),
  };
  await db.systemMaps.add(map);
  return id;
}

export async function saveSystemMap(map: SystemMap): Promise<void> {
  await db.systemMaps.put({ ...map, updatedAt: now() });
}

export async function deleteSystemMap(id: string): Promise<void> {
  await db.systemMaps.delete(id);
}

// ---- Experiments (Phase 4: Innovation Lab) ----
export async function createExperiment(sessionId?: string): Promise<string> {
  const id = newId();
  const experiment: Experiment = {
    id,
    sessionId,
    title: '',
    technique: 'assumptions',
    subject: '',
    assumptionChallenges: [],
    fundamentals: [],
    reconstruction: '',
    constraintsToDrop: [],
    reimagined: '',
    insight: '',
    createdAt: now(),
    updatedAt: now(),
  };
  await db.experiments.add(experiment);
  return id;
}

export async function saveExperiment(experiment: Experiment): Promise<void> {
  await db.experiments.put({ ...experiment, updatedAt: now() });
}

export async function deleteExperiment(id: string): Promise<void> {
  await db.experiments.delete(id);
}

// ---- Weekly Reviews (Phase 5) ----
// A review is keyed by its week start, so there is exactly one per week.
// Created lazily on first edit (saveReview is an upsert) — merely browsing a
// week does not write a row.
export async function saveReview(review: Review): Promise<void> {
  await db.reviews.put({ ...review, updatedAt: now() });
}

// ---- Connections (Phase 6: Cognitive Repository) ----
// Undirected links the founder draws between two artifacts (the graph edges).
export async function createConnection(
  from: { kind: ArtifactKind; id: string },
  to: { kind: ArtifactKind; id: string },
  note = '',
): Promise<void> {
  const connection: Connection = {
    id: newId(),
    fromKind: from.kind,
    fromId: from.id,
    toKind: to.kind,
    toId: to.id,
    note,
    createdAt: now(),
  };
  await db.connections.add(connection);
}

export async function deleteConnection(id: string): Promise<void> {
  await db.connections.delete(id);
}

// ---- AI settings (Phase 3) ----
export async function getAISettings(): Promise<AISettings> {
  const existing = await db.settings.get('ai');
  return existing ?? DEFAULT_AI_SETTINGS;
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await db.settings.put({ ...settings, id: 'ai', updatedAt: now() });
}

// ---- Coaching notes (Phase 3) ----
export async function saveCoaching(c: Omit<Coaching, 'createdAt'>): Promise<void> {
  await db.coachings.put({ ...c, createdAt: now() });
}

export async function deleteCoaching(id: string): Promise<void> {
  await db.coachings.delete(id);
}
