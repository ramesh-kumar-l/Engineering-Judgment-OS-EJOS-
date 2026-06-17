import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { createSystemMap, getOrCreateTodaySession } from '@/db/repository';
import { Button } from '@/components/ui';
import { SystemMapEditor } from './SystemMapEditor';

// Systems Thinking workspace. Master/detail over System Maps.
export function SystemsWorkspaceScreen() {
  const maps = useLiveQuery(() => db.systemMaps.orderBy('updatedAt').reverse().toArray(), []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const startNew = async () => {
    const session = await getOrCreateTodaySession();
    const id = await createSystemMap(session.id);
    setActiveId(id);
  };

  const active = maps?.find((m) => m.id === activeId) ?? null;

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-[var(--color-border)] p-4">
        <Button onClick={startNew} className="mb-4 w-full">
          + New system map
        </Button>
        <div className="flex flex-col gap-1">
          {maps?.length === 0 && (
            <p className="px-2 text-sm text-[var(--color-text-muted)]">No system maps yet.</p>
          )}
          {maps?.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className={`truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                m.id === activeId
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {m.title || 'Untitled system'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {active ? (
          <SystemMapEditor key={active.id} map={active} onDeleted={() => setActiveId(null)} />
        ) : (
          <div className="mx-auto max-w-md pt-24 text-center text-sm text-[var(--color-text-muted)]">
            Select a map on the left, or start a new one. Most problems are systems — find the
            structure before you push on it.
          </div>
        )}
      </div>
    </div>
  );
}
