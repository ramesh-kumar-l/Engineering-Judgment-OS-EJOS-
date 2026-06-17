// Local-first data layer (AD-001). IndexedDB via Dexie is the SOURCE OF TRUTH.
// All writes are local and never depend on the network.
import Dexie, { type EntityTable } from 'dexie';
import type { Session, Problem, Decision } from '@/domain/types';

const db = new Dexie('ejos') as Dexie & {
  sessions: EntityTable<Session, 'id'>;
  problems: EntityTable<Problem, 'id'>;
  decisions: EntityTable<Decision, 'id'>;
};

db.version(1).stores({
  sessions: 'id, date, updatedAt',
  problems: 'id, sessionId, updatedAt',
  decisions: 'id, sessionId, status, updatedAt',
});

export { db };
