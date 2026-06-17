import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { ScreenHeader, TextInput } from '@/components/ui';
import {
  collectArtifacts,
  indexByKey,
  searchArtifacts,
  type AllArtifacts,
} from '@/cognitive/artifacts';
import { SearchResults } from '@/cognitive/SearchResults';
import { ThinkingGraph } from '@/cognitive/ThinkingGraph';
import { ConnectionsEditor } from '@/cognitive/ConnectionsEditor';

// Phase 6 — Cognitive Repository. Search across everything, link related
// thinking, and see the graph those links form. All local, all offline.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-6">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function RepositoryScreen() {
  const [query, setQuery] = useState('');

  const data = useLiveQuery<AllArtifacts>(
    async () => ({
      sessions: await db.sessions.toArray(),
      problems: await db.problems.toArray(),
      decisions: await db.decisions.toArray(),
      systemMaps: await db.systemMaps.toArray(),
      experiments: await db.experiments.toArray(),
      reviews: await db.reviews.toArray(),
    }),
    [],
  );
  const connections = useLiveQuery(() => db.connections.toArray(), []) ?? [];

  const refs = useMemo(() => (data ? collectArtifacts(data) : []), [data]);
  const refsByKey = useMemo(() => indexByKey(refs), [refs]);
  const results = useMemo(() => searchArtifacts(refs, query), [refs, query]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-8">
      <ScreenHeader
        title="Cognitive Repository"
        subtitle="Everything you've thought through, searchable and connected. Find an idea, then link it to the thinking around it."
      />

      <TextInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search problems, decisions, maps, experiments, reviews…"
      />
      <SearchResults query={query} results={results} />

      <Section title="Thinking graph">
        <ThinkingGraph refsByKey={refsByKey} connections={connections} />
      </Section>

      <Section title="Connections">
        <ConnectionsEditor refs={refs} refsByKey={refsByKey} connections={connections} />
      </Section>
    </div>
  );
}
