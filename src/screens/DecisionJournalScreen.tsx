import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { Confidence, Decision } from '@/domain/types';
import { createDecision, saveDecision, deleteDecision, getOrCreateTodaySession } from '@/db/repository';
import { Button, Field, ListEditor, ScreenHeader, TextArea, TextInput } from '@/components/ui';
import { CoachPanel } from '@/components/CoachPanel';

const confidences: Confidence[] = ['low', 'medium', 'high'];

// Decision Journal. Records reasoning + confidence now; outcome reviewed later.
export function DecisionJournalScreen() {
  const decisions = useLiveQuery(() => db.decisions.orderBy('updatedAt').reverse().toArray(), []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const startNew = async () => {
    const session = await getOrCreateTodaySession();
    const id = await createDecision(session.id);
    setActiveId(id);
  };

  const active = decisions?.find((d) => d.id === activeId) ?? null;

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-[var(--color-border)] p-4">
        <Button onClick={startNew} className="mb-4 w-full">
          + New decision
        </Button>
        <div className="flex flex-col gap-1">
          {decisions?.length === 0 && (
            <p className="px-2 text-sm text-[var(--color-text-muted)]">No decisions recorded yet.</p>
          )}
          {decisions?.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                d.id === activeId
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  d.status === 'reviewed' ? 'bg-emerald-500' : 'bg-[var(--color-text-muted)]'
                }`}
              />
              <span className="truncate">{d.title || 'Untitled decision'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {active ? (
          <DecisionEditor key={active.id} decision={active} onDeleted={() => setActiveId(null)} />
        ) : (
          <div className="mx-auto max-w-md pt-24 text-center text-sm text-[var(--color-text-muted)]">
            Record a decision with your reasoning and confidence now — so you can review whether you
            were right later.
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionEditor({ decision, onDeleted }: { decision: Decision; onDeleted: () => void }) {
  const update = (patch: Partial<Decision>) => saveDecision({ ...decision, ...patch });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <ScreenHeader
        title="Decision Record"
        subtitle="Reasoning and confidence, captured at the moment of deciding."
        action={
          <Button
            variant="danger"
            onClick={async () => {
              await deleteDecision(decision.id);
              onDeleted();
            }}
          >
            Delete
          </Button>
        }
      />

      <Field label="Title">
        <TextInput
          value={decision.title}
          placeholder="The decision in one line"
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>

      <Field label="Context" hint="What situation forces this decision now?">
        <TextArea
          value={decision.context}
          onChange={(e) => update({ context: e.target.value })}
          placeholder="The forces at play…"
        />
      </Field>

      <Field label="Options considered" hint="What real alternatives did you weigh?">
        <ListEditor
          items={decision.options}
          onChange={(options) => update({ options })}
          placeholder="Add an option…"
        />
      </Field>

      <Field label="Chosen option">
        <TextInput
          value={decision.chosenOption}
          placeholder="What did you decide?"
          onChange={(e) => update({ chosenOption: e.target.value })}
        />
      </Field>

      <Field label="Reasoning" hint="Why this, over the alternatives? Name the tradeoffs.">
        <TextArea
          value={decision.reasoning}
          onChange={(e) => update({ reasoning: e.target.value })}
          placeholder="The tradeoffs you accepted and why…"
        />
      </Field>

      <Field label="Confidence" hint="How sure are you, honestly?">
        <div className="flex gap-2">
          {confidences.map((c) => (
            <button
              key={c}
              onClick={() => update({ confidence: c })}
              className={`rounded-md border px-3 py-1.5 text-sm capitalize transition-colors ${
                decision.confidence === c
                  ? 'border-[var(--color-accent)] bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Expected outcome" hint="What do you predict will happen? Be specific.">
        <TextArea
          value={decision.expectedOutcome}
          onChange={(e) => update({ expectedOutcome: e.target.value })}
          placeholder="If this decision is right, then…"
        />
      </Field>

      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Outcome review {decision.status === 'reviewed' ? '· reviewed' : '· pending'}
          </span>
        </div>
        <Field label="Actual outcome" hint="Come back later. What actually happened?">
          <TextArea
            value={decision.actualOutcome}
            onChange={(e) => update({ actualOutcome: e.target.value })}
            placeholder="Fill this in once you know…"
          />
        </Field>
        <div className="mt-3">
          <Button
            variant="ghost"
            onClick={() =>
              update({ status: decision.status === 'reviewed' ? 'open' : 'reviewed' })
            }
          >
            {decision.status === 'reviewed' ? 'Mark as open' : 'Mark as reviewed'}
          </Button>
        </div>
      </div>

      <CoachPanel target={{ kind: 'decision', data: decision }} />
    </div>
  );
}
