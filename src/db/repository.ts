// Repository: the only module that owns persistence. UI/domain go through here.
import { db } from './database';
import {
  type Session,
  type Problem,
  type Decision,
  type Confidence,
  newId,
  todayISO,
} from '@/domain/types';

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
