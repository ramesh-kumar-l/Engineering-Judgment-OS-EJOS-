import { useState } from 'react';
import type { SystemMap, SystemConnection, Polarity } from '@/domain/types';
import { newId } from '@/domain/types';
import { saveSystemMap, deleteSystemMap } from '@/db/repository';
import { Button, Field, ListEditor, ScreenHeader, TextArea, TextInput } from '@/components/ui';
import { SystemMapDiagram } from '@/components/SystemMapDiagram';
import { CoachPanel } from '@/components/CoachPanel';

// Detail editor for one System Map. All edits persist immediately (saveSystemMap).
export function SystemMapEditor({ map, onDeleted }: { map: SystemMap; onDeleted: () => void }) {
  const update = (patch: Partial<SystemMap>) => saveSystemMap({ ...map, ...patch });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <ScreenHeader
        title="System Map"
        subtitle="Map the parts and how they affect each other. Structure drives behavior."
        action={
          <Button
            variant="danger"
            onClick={async () => {
              await deleteSystemMap(map.id);
              onDeleted();
            }}
          >
            Delete
          </Button>
        }
      />

      <SystemMapDiagram nodes={map.nodes} connections={map.connections} />

      <Field label="Title">
        <TextInput
          value={map.title}
          placeholder="What system are you looking at?"
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>

      <Field label="Description" hint="The boundary: what's in this system, and why look at it now?">
        <TextArea
          value={map.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe the system and its boundary…"
        />
      </Field>

      <Field label="Parts" hint="The variables, actors, or components that make up the system.">
        <NodesEditor map={map} onChange={update} />
      </Field>

      <Field label="Connections" hint="A → B: does it amplify (reinforcing) or stabilize (balancing)?">
        <ConnectionsEditor map={map} onChange={update} />
      </Field>

      <Field label="Feedback loops" hint="Where do effects circle back? Name the reinforcing / balancing loops.">
        <ListEditor
          items={map.feedbackLoops}
          onChange={(feedbackLoops) => update({ feedbackLoops })}
          placeholder="Describe a loop…"
        />
      </Field>

      <Field label="Leverage points" hint="Where would a small change produce a large effect?">
        <ListEditor
          items={map.leveragePoints}
          onChange={(leveragePoints) => update({ leveragePoints })}
          placeholder="Add a leverage point…"
        />
      </Field>

      <Field label="Reflection" hint="What did mapping reveal? Second-order effects, surprises, what you'd change.">
        <TextArea
          value={map.reflection}
          onChange={(e) => update({ reflection: e.target.value })}
          placeholder="What surprised you once you saw the structure?"
        />
      </Field>

      <CoachPanel target={{ kind: 'systemMap', data: map }} />
    </div>
  );
}

// Parts of the system. Each carries a stable id so connections can reference it.
function NodesEditor({ map, onChange }: { map: SystemMap; onChange: (patch: Partial<SystemMap>) => void }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    onChange({ nodes: [...map.nodes, { id: newId(), label }] });
    setDraft('');
  };

  const remove = (id: string) => {
    // Pruning keeps the graph consistent: drop links touching the removed part.
    onChange({
      nodes: map.nodes.filter((n) => n.id !== id),
      connections: map.connections.filter((c) => c.fromId !== id && c.toId !== id),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        {map.nodes.map((n) => (
          <div
            key={n.id}
            className="flex items-center gap-2 rounded-md bg-[var(--color-surface-2)] px-2.5 py-1.5 text-sm"
          >
            <span className="flex-1">{n.label}</span>
            <button
              onClick={() => remove(n.id)}
              className="text-[var(--color-text-muted)] hover:text-red-400"
              aria-label="Remove part"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <TextInput
          value={draft}
          placeholder="Add a part…"
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
  );
}

const selectClasses =
  'rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none';

// Directed causal links between parts.
function ConnectionsEditor({
  map,
  onChange,
}: {
  map: SystemMap;
  onChange: (patch: Partial<SystemMap>) => void;
}) {
  const labelOf = (id: string) => map.nodes.find((n) => n.id === id)?.label ?? '(removed)';

  const addLink = () => {
    if (map.nodes.length < 2) return;
    const link: SystemConnection = {
      id: newId(),
      fromId: map.nodes[0].id,
      toId: map.nodes[1].id,
      polarity: 'reinforcing',
      note: '',
    };
    onChange({ connections: [...map.connections, link] });
  };

  const patchLink = (id: string, patch: Partial<SystemConnection>) =>
    onChange({ connections: map.connections.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const removeLink = (id: string) =>
    onChange({ connections: map.connections.filter((c) => c.id !== id) });

  if (map.nodes.length < 2) {
    return <p className="text-sm text-[var(--color-text-muted)]">Add at least two parts to connect them.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {map.connections.map((c) => (
        <div key={c.id} className="flex flex-col gap-2 rounded-md bg-[var(--color-surface-2)] p-2.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select
              value={c.fromId}
              onChange={(e) => patchLink(c.id, { fromId: e.target.value })}
              className={selectClasses}
            >
              {map.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
            <PolarityToggle value={c.polarity} onChange={(polarity) => patchLink(c.id, { polarity })} />
            <select
              value={c.toId}
              onChange={(e) => patchLink(c.id, { toId: e.target.value })}
              className={selectClasses}
            >
              {map.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeLink(c.id)}
              className="ml-auto text-[var(--color-text-muted)] hover:text-red-400"
              aria-label="Remove connection"
            >
              ×
            </button>
          </div>
          <TextInput
            value={c.note}
            placeholder={`How does ${labelOf(c.fromId)} affect ${labelOf(c.toId)}?`}
            onChange={(e) => patchLink(c.id, { note: e.target.value })}
          />
        </div>
      ))}
      <Button variant="ghost" onClick={addLink} className="self-start">
        + Add connection
      </Button>
    </div>
  );
}

function PolarityToggle({ value, onChange }: { value: Polarity; onChange: (p: Polarity) => void }) {
  const options: { key: Polarity; label: string }[] = [
    { key: 'reinforcing', label: 'reinforces →' },
    { key: 'balancing', label: 'balances →' },
  ];
  return (
    <div className="flex overflow-hidden rounded-md border border-[var(--color-border)]">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-2 py-1.5 text-xs transition-colors ${
            value === o.key
              ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
