// Golden examples — labeled, idempotent demo data so a first-time user can see a
// fully worked EJOS workspace immediately. Part of the data layer (it owns persistence,
// like repository.ts); UI calls these, never `db` directly.
//
// All seeded rows use deterministic ids, so:
//  - bulkPut is idempotent by id (re-loading never duplicates), and
//  - removal deletes exactly the seeded rows and nothing the user created.
import { db } from './database';
import type {
  Session,
  Problem,
  Decision,
  SystemMap,
  Experiment,
  Review,
  Connection,
} from '@/domain/types';
import { ejosExample } from './seedData.ejos';
import { fitnessExample } from './seedData.fitness';

export interface ExampleBundle {
  sessions: Session[];
  problems: Problem[];
  decisions: Decision[];
  systemMaps: SystemMap[];
  experiments: Experiment[];
  reviews: Review[];
  connections: Connection[];
}

const bundles: ExampleBundle[] = [ejosExample, fitnessExample];

// The stores touched by every seed/remove transaction.
const stores = [
  db.sessions,
  db.problems,
  db.decisions,
  db.systemMaps,
  db.experiments,
  db.reviews,
  db.connections,
];

/** Write both golden examples. Idempotent: safe to call repeatedly. */
export async function seedGoldenExamples(): Promise<void> {
  await db.transaction('rw', stores, async () => {
    for (const b of bundles) {
      await db.sessions.bulkPut(b.sessions);
      await db.problems.bulkPut(b.problems);
      await db.decisions.bulkPut(b.decisions);
      await db.systemMaps.bulkPut(b.systemMaps);
      await db.experiments.bulkPut(b.experiments);
      await db.reviews.bulkPut(b.reviews);
      await db.connections.bulkPut(b.connections);
    }
  });
}

/** Remove only the seeded rows, leaving any user-created data untouched. */
export async function removeGoldenExamples(): Promise<void> {
  await db.transaction('rw', stores, async () => {
    for (const b of bundles) {
      await db.sessions.bulkDelete(b.sessions.map((x) => x.id));
      await db.problems.bulkDelete(b.problems.map((x) => x.id));
      await db.decisions.bulkDelete(b.decisions.map((x) => x.id));
      await db.systemMaps.bulkDelete(b.systemMaps.map((x) => x.id));
      await db.experiments.bulkDelete(b.experiments.map((x) => x.id));
      await db.reviews.bulkDelete(b.reviews.map((x) => x.id));
      await db.connections.bulkDelete(b.connections.map((x) => x.id));
    }
  });
}

/** True if the examples are currently loaded (checks a sentinel seeded row). */
export async function hasGoldenExamples(): Promise<boolean> {
  const sentinel = bundles[0]?.sessions[0]?.id;
  if (!sentinel) return false;
  return (await db.sessions.get(sentinel)) != null;
}
