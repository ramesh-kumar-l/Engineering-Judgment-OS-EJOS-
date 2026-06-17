// Local-first data layer (AD-001). IndexedDB via Dexie is the SOURCE OF TRUTH.
// All writes are local and never depend on the network.
import Dexie, { type EntityTable } from 'dexie';
import type { Session, Problem, Decision, SystemMap } from '@/domain/types';

const db = new Dexie('ejos') as Dexie & {
  sessions: EntityTable<Session, 'id'>;
  problems: EntityTable<Problem, 'id'>;
  decisions: EntityTable<Decision, 'id'>;
  systemMaps: EntityTable<SystemMap, 'id'>;
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

export { db };
