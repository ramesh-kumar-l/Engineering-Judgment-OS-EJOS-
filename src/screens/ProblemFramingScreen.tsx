import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Problem } from '@/domain/types';
import { createProblem, saveProblem, deleteProblem, getOrCreateTodaySession } from '@/db/repository';
import { Button, Field, ListEditor, ScreenHeader, TextArea, TextInput } from '@/components/ui';

// Problem Framing workspace. Outputs: assumptions, stakeholders, root-cause notes.
export function ProblemFramingScreen() {
  const problems = useLiveQuery(() => db.problems.orderBy('updatedAt').reverse().toArray(), []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const startNew = async () => {
    const session = await getOrCreateTodaySession();
    const id = await createProblem(session.id);
    setActiveId(id);
  };

  const active = problems?.find((p) => p.id === activeId) ?? null;

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-[var(--color-border)] p-4">
        <Button onClick={startNew} className="mb-4 w-full">
          + New framing
        </Button>
        <div className="flex flex-col gap-1">
          {problems?.length === 0 && (
            <p className="px-2 text-sm text-[var(--color-text-muted)]">No problems framed yet.</p>
          )}
          {problems?.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                p.id === activeId
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {p.title || 'Untitled problem'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {active ? (
          <ProblemEditor key={active.id} problem={active} onDeleted={() => setActiveId(null)} />
        ) : (
          <div className="mx-auto max-w-md pt-24 text-center text-sm text-[var(--color-text-muted)]">
            Select a framing on the left, or start a new one. Framing a problem well is half of
            solving it.
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemEditor({ problem, onDeleted }: { problem: Problem; onDeleted: () => void }) {
  // Local edit buffer; persisted on change via saveProblem.
  const update = (patch: Partial<Problem>) => saveProblem({ ...problem, ...patch });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <ScreenHeader
        title="Problem Framing"
        subtitle="Surface what you're assuming, who's affected, and the real root cause."
        action={
          <Button
            variant="danger"
            onClick={async () => {
              await deleteProblem(problem.id);
              onDeleted();
            }}
          >
            Delete
          </Button>
        }
      />

      <Field label="Title">
        <TextInput
          value={problem.title}
          placeholder="One line: what is the problem?"
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>

      <Field label="Problem statement" hint="What's actually happening, and why does it matter?">
        <TextArea
          value={problem.statement}
          onChange={(e) => update({ statement: e.target.value })}
          placeholder="Describe the problem precisely…"
        />
      </Field>

      <Field label="Assumptions" hint="What are you taking for granted? Each one is a risk.">
        <ListEditor
          items={problem.assumptions}
          onChange={(assumptions) => update({ assumptions })}
          placeholder="Add an assumption…"
        />
      </Field>

      <Field label="Stakeholders" hint="Who is affected? Whose incentives matter here?">
        <ListEditor
          items={problem.stakeholders}
          onChange={(stakeholders) => update({ stakeholders })}
          placeholder="Add a stakeholder…"
        />
      </Field>

      <Field label="Root-cause notes" hint="Keep asking 'why'. Don't stop at the first cause.">
        <TextArea
          value={problem.rootCauseNotes}
          onChange={(e) => update({ rootCauseNotes: e.target.value })}
          placeholder="Trace the problem to its source…"
        />
      </Field>
    </div>
  );
}
