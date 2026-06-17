import { useState } from 'react';
import type { Experiment, LabTechnique, AssumptionChallenge } from '@/domain/types';
import { newId } from '@/domain/types';
import { saveExperiment, deleteExperiment } from '@/db/repository';
import { Button, Field, ListEditor, ScreenHeader, TextArea, TextInput } from '@/components/ui';
import { CoachPanel } from '@/components/CoachPanel';

const TECHNIQUES: { key: LabTechnique; label: string; blurb: string }[] = [
  { key: 'assumptions', label: 'Challenge assumptions', blurb: 'List what you treat as fixed — then attack each one.' },
  { key: 'first-principles', label: 'First principles', blurb: 'Strip to irreducible truths, then rebuild without convention.' },
  { key: 'redesign', label: 'Redesign', blurb: 'Drop a "sacred" constraint and imagine the bolder version.' },
];

// Detail editor for one Innovation Lab experiment. Edits persist immediately.
export function ExperimentEditor({ exp, onDeleted }: { exp: Experiment; onDeleted: () => void }) {
  const update = (patch: Partial<Experiment>) => saveExperiment({ ...exp, ...patch });
  const active = TECHNIQUES.find((t) => t.key === exp.technique)!;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <ScreenHeader
        title="Innovation Lab"
        subtitle="Challenge the status quo. Pick a lens and push past the obvious answer."
        action={
          <Button
            variant="danger"
            onClick={async () => {
              await deleteExperiment(exp.id);
              onDeleted();
            }}
          >
            Delete
          </Button>
        }
      />

      <Field label="Title">
        <TextInput
          value={exp.title}
          placeholder="Name this experiment"
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>

      <Field label="Subject" hint="What are you reimagining? The design, process, or belief under examination.">
        <TextArea
          value={exp.subject}
          onChange={(e) => update({ subject: e.target.value })}
          placeholder="Describe what you're putting on the table…"
        />
      </Field>

      <Field label="Lens" hint={active.blurb}>
        <TechniqueToggle value={exp.technique} onChange={(technique) => update({ technique })} />
      </Field>

      {exp.technique === 'assumptions' && (
        <AssumptionChallengesEditor exp={exp} onChange={update} />
      )}

      {exp.technique === 'first-principles' && (
        <>
          <Field label="Fundamental truths" hint="What must actually be true here, independent of how it's done today?">
            <ListEditor
              items={exp.fundamentals}
              onChange={(fundamentals) => update({ fundamentals })}
              placeholder="Add a fundamental truth…"
            />
          </Field>
          <Field label="Reconstruction" hint="Rebuild from those truths alone. If you started today, what would you do?">
            <TextArea
              value={exp.reconstruction}
              onChange={(e) => update({ reconstruction: e.target.value })}
              placeholder="Reason up from the fundamentals…"
            />
          </Field>
        </>
      )}

      {exp.technique === 'redesign' && (
        <>
          <Field label="Constraints to drop" hint="Which 'givens' are really just convention or inertia?">
            <ListEditor
              items={exp.constraintsToDrop}
              onChange={(constraintsToDrop) => update({ constraintsToDrop })}
              placeholder="Add a constraint worth questioning…"
            />
          </Field>
          <Field label="Reimagined" hint="If those constraints fell away, what would the bolder version look like?">
            <TextArea
              value={exp.reimagined}
              onChange={(e) => update({ reimagined: e.target.value })}
              placeholder="Describe the redesign…"
            />
          </Field>
        </>
      )}

      <Field label="Insight" hint="What shifted? The breakthrough, the next experiment, or the bet worth making.">
        <TextArea
          value={exp.insight}
          onChange={(e) => update({ insight: e.target.value })}
          placeholder="What did this lens reveal?"
        />
      </Field>

      <CoachPanel target={{ kind: 'experiment', data: exp }} />
    </div>
  );
}

function TechniqueToggle({ value, onChange }: { value: LabTechnique; onChange: (t: LabTechnique) => void }) {
  return (
    <div className="flex flex-wrap overflow-hidden rounded-md border border-[var(--color-border)]">
      {TECHNIQUES.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 text-xs transition-colors ${
            value === t.key
              ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Pairs of (assumption, the move that challenges it).
function AssumptionChallengesEditor({
  exp,
  onChange,
}: {
  exp: Experiment;
  onChange: (patch: Partial<Experiment>) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const assumption = draft.trim();
    if (!assumption) return;
    const item: AssumptionChallenge = { id: newId(), assumption, challenge: '' };
    onChange({ assumptionChallenges: [...exp.assumptionChallenges, item] });
    setDraft('');
  };

  const patch = (id: string, p: Partial<AssumptionChallenge>) =>
    onChange({
      assumptionChallenges: exp.assumptionChallenges.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });

  const remove = (id: string) =>
    onChange({ assumptionChallenges: exp.assumptionChallenges.filter((a) => a.id !== id) });

  return (
    <Field label="Assumption challenges" hint="State a belief you've been taking for granted, then ask: what if it's false?">
      <div className="flex flex-col gap-2">
        {exp.assumptionChallenges.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 rounded-md bg-[var(--color-surface-2)] p-2.5">
            <div className="flex items-start gap-2">
              <span className="flex-1 text-sm font-medium text-[var(--color-text)]">{a.assumption}</span>
              <button
                onClick={() => remove(a.id)}
                className="text-[var(--color-text-muted)] hover:text-red-400"
                aria-label="Remove assumption"
              >
                ×
              </button>
            </div>
            <TextInput
              value={a.challenge}
              placeholder="If this were false, what breaks — or what becomes possible?"
              onChange={(e) => patch(a.id, { challenge: e.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <TextInput
            value={draft}
            placeholder="Add an assumption…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button variant="ghost" onClick={add}>
            Add
          </Button>
        </div>
      </div>
    </Field>
  );
}
