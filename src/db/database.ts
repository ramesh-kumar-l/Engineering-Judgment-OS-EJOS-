// Local-first data layer (AD-001). IndexedDB via Dexie is the SOURCE OF TRUTH.
// All writes are local and never depend on the network.
import Dexie, { type EntityTable } from 'dexie';
import type { Session, Problem, Decision, SystemMap, Coaching } from '@/domain/types';
import type { AISettings } from '@/ai/types';

const db = new Dexie('ejos') as Dexie & {
  sessions: EntityTable<Session, 'id'>;
  problems: EntityTable<Problem, 'id'>;
  decisions: EntityTable<Decision, 'id'>;
  systemMaps: EntityTable<SystemMap, 'id'>;
  coachings: EntityTable<Coaching, 'id'>;
  settings: EntityTable<AISettings, 'id'>;
};

db.version(1).stores({
  sessions: 'id, date, updatedAt',
  problems: 'id, sessionId, updatedAt',
  decisions: 'id, sessionId, status, updatedAt',
});

// v2 (Phase 2): add System Maps. Existing stores carry forward unchanged.
db.version(2).stores({
  systemMaps: 'id, sessionId, updatedAt',
});

// v3 (Phase 3): AI settings (single row) + per-artifact coaching notes.
db.version(3).stores({
  settings: 'id',
  coachings: 'id, targetKind',
});

export { db };
