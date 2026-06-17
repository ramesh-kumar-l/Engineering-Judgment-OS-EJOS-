import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { createExperiment, getOrCreateTodaySession } from '@/db/repository';
import { Button } from '@/components/ui';
import { ExperimentEditor } from './ExperimentEditor';

// Innovation Lab workspace. Master/detail over experiments.
export function InnovationLabScreen() {
  const experiments = useLiveQuery(
    () => db.experiments.orderBy('updatedAt').reverse().toArray(),
    [],
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const startNew = async () => {
    const session = await getOrCreateTodaySession();
    const id = await createExperiment(session.id);
    setActiveId(id);
  };

  const active = experiments?.find((e) => e.id === activeId) ?? null;

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-[var(--color-border)] p-4">
        <Button onClick={startNew} className="mb-4 w-full">
          + New experiment
        </Button>
        <div className="flex flex-col gap-1">
          {experiments?.length === 0 && (
            <p className="px-2 text-sm text-[var(--color-text-muted)]">No experiments yet.</p>
          )}
          {experiments?.map((e) => (
            <button
              key={e.id}
              onClick={() => setActiveId(e.id)}
              className={`truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                e.id === activeId
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {e.title || 'Untitled experiment'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {active ? (
          <ExperimentEditor key={active.id} exp={active} onDeleted={() => setActiveId(null)} />
        ) : (
          <div className="mx-auto max-w-md pt-24 text-center text-sm text-[var(--color-text-muted)]">
            Select an experiment, or start a new one. The best answer is rarely the first one — pick
            a lens and break the problem open.
          </div>
        )}
      </div>
    </div>
  );
}
