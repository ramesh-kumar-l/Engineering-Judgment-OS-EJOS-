// Read-only thinking graph (Phase 6). Artifacts that the founder has linked
// sit on a ring; connections are undirected edges between them. Deterministic
// and dependency-free (stable + offline), mirroring SystemMapDiagram.
import type { ArtifactKind, Connection } from '@/domain/types';
import type { ArtifactRef } from './artifacts';
import { refKey } from './artifacts';

const SIZE = 420;
const CENTER = SIZE / 2;
const RING = 160;
const NODE_R = 30;

// One muted hue per kind — a legend cue, not a ranking.
const KIND_COLOR: Record<ArtifactKind, string> = {
  session: '#94a3b8', // slate
  problem: '#f59e0b', // amber
  decision: '#34d399', // emerald
  systemMap: '#38bdf8', // sky
  experiment: '#a78bfa', // violet
  review: '#f472b6', // pink
};

export function ThinkingGraph({
  refsByKey,
  connections,
}: {
  refsByKey: Map<string, ArtifactRef>;
  connections: Connection[];
}) {
  // Only show artifacts that actually participate in a connection.
  const present = new Map<string, ArtifactRef>();
  for (const c of connections) {
    const a = refsByKey.get(refKey(c.fromKind, c.fromId));
    const b = refsByKey.get(refKey(c.toKind, c.toId));
    if (a) present.set(refKey(a.kind, a.id), a);
    if (b) present.set(refKey(b.kind, b.id), b);
  }
  const nodes = [...present.values()];

  if (nodes.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
        Connect two artifacts below to start mapping how your thinking links together.
      </div>
    );
  }

  const pos = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    const k = refKey(node.kind, node.id);
    if (nodes.length === 1) {
      pos.set(k, { x: CENTER, y: CENTER });
      return;
    }
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / nodes.length;
    pos.set(k, { x: CENTER + RING * Math.cos(angle), y: CENTER + RING * Math.sin(angle) });
  });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="aspect-square w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
      role="img"
      aria-label="Thinking graph"
    >
      {connections.map((c) => {
        const from = pos.get(refKey(c.fromKind, c.fromId));
        const to = pos.get(refKey(c.toKind, c.toId));
        if (!from || !to) return null;
        return (
          <line
            key={c.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--color-border)"
            strokeWidth={1.5}
            opacity={0.8}
          />
        );
      })}

      {nodes.map((node) => {
        const p = pos.get(refKey(node.kind, node.id))!;
        return (
          <g key={refKey(node.kind, node.id)}>
            <circle cx={p.x} cy={p.y} r={NODE_R} fill="var(--color-surface-2)" stroke={KIND_COLOR[node.kind]} strokeWidth={2} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="var(--color-text)">
              {node.title.length > 12 ? `${node.title.slice(0, 11)}…` : node.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
