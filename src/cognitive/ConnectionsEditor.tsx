// Create, list, and remove cross-artifact connections (Phase 6).
// The founder decides what relates to what — the graph never infers links.
import { useState } from 'react';
import { createConnection, deleteConnection } from '@/db/repository';
import type { ArtifactKind, Connection } from '@/domain/types';
import { KIND_LABEL, refKey, type ArtifactRef } from './artifacts';
import { Button, Field, TextInput } from '@/components/ui';

const selectClasses =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none';

function parseKey(key: string): { kind: ArtifactKind; id: string } {
  const i = key.indexOf(':');
  return { kind: key.slice(0, i) as ArtifactKind, id: key.slice(i + 1) };
}

function ArtifactSelect({
  value,
  onChange,
  refs,
}: {
  value: string;
  onChange: (v: string) => void;
  refs: ArtifactRef[];
}) {
  return (
    <select className={selectClasses} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select an artifact…</option>
      {refs.map((r) => (
        <option key={refKey(r.kind, r.id)} value={refKey(r.kind, r.id)}>
          [{KIND_LABEL[r.kind]}] {r.title}
        </option>
      ))}
    </select>
  );
}

export function ConnectionsEditor({
  refs,
  refsByKey,
  connections,
}: {
  refs: ArtifactRef[];
  refsByKey: Map<string, ArtifactRef>;
  connections: Connection[];
}) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');

  const add = async () => {
    if (!from || !to || from === to) return;
    await createConnection(parseKey(from), parseKey(to), note.trim());
    setFrom('');
    setTo('');
    setNote('');
  };

  const label = (kind: ArtifactKind, id: string) =>
    refsByKey.get(refKey(kind, id))?.title ?? '(removed)';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Connect this">
          <ArtifactSelect value={from} onChange={setFrom} refs={refs} />
        </Field>
        <Field label="…to this">
          <ArtifactSelect value={to} onChange={setTo} refs={refs} />
        </Field>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field label="Why they relate" hint="Optional — the thread between them.">
            <TextInput
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. this decision tested that assumption"
            />
          </Field>
        </div>
        <Button onClick={add} disabled={!from || !to || from === to}>
          Connect
        </Button>
      </div>

      {connections.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-4">
          {connections.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-md bg-[var(--color-surface-2)] px-3 py-2 text-sm"
            >
              <span className="flex-1">
                <span className="text-[var(--color-text)]">{label(c.fromKind, c.fromId)}</span>
                <span className="mx-1.5 text-[var(--color-text-muted)]">↔</span>
                <span className="text-[var(--color-text)]">{label(c.toKind, c.toId)}</span>
                {c.note && <span className="ml-2 text-xs text-[var(--color-text-muted)]">— {c.note}</span>}
              </span>
              <button
                onClick={() => deleteConnection(c.id)}
                className="text-[var(--color-text-muted)] hover:text-red-400"
                aria-label="Remove connection"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
