import type { SystemNode, SystemConnection } from '@/domain/types';

// Read-only, auto-laid-out view of a system map: nodes on a ring, directed
// causal links between them. Deterministic and dependency-free (stable + offline).
// Reinforcing links amplify; balancing links stabilize.

const SIZE = 360;
const CENTER = SIZE / 2;
const RING = 130; // radius of the node ring
const NODE_R = 26;

const COLOR = {
  reinforcing: '#34d399', // muted emerald — amplifies
  balancing: '#38bdf8', // muted sky — stabilizes
} as const;

function nodePositions(nodes: SystemNode[]) {
  const pos = new Map<string, { x: number; y: number }>();
  const n = nodes.length;
  nodes.forEach((node, i) => {
    if (n === 1) {
      pos.set(node.id, { x: CENTER, y: CENTER });
      return;
    }
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    pos.set(node.id, {
      x: CENTER + RING * Math.cos(angle),
      y: CENTER + RING * Math.sin(angle),
    });
  });
  return pos;
}

// Shorten an edge so its arrowhead lands at the node's edge, not its center.
function trim(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: from.x + ux * NODE_R,
    y1: from.y + uy * NODE_R,
    x2: to.x - ux * (NODE_R + 6),
    y2: to.y - uy * (NODE_R + 6),
  };
}

export function SystemMapDiagram({
  nodes,
  connections,
}: {
  nodes: SystemNode[];
  connections: SystemConnection[];
}) {
  if (nodes.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
        Add parts below to see the system take shape.
      </div>
    );
  }

  const pos = nodePositions(nodes);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="aspect-square w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
      role="img"
      aria-label="System map diagram"
    >
      <defs>
        {(['reinforcing', 'balancing'] as const).map((p) => (
          <marker
            key={p}
            id={`arrow-${p}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR[p]} />
          </marker>
        ))}
      </defs>

      {connections.map((c) => {
        const from = pos.get(c.fromId);
        const to = pos.get(c.toId);
        if (!from || !to || c.fromId === c.toId) return null;
        const { x1, y1, x2, y2 } = trim(from, to);
        return (
          <line
            key={c.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={COLOR[c.polarity]}
            strokeWidth={1.5}
            opacity={0.8}
            markerEnd={`url(#arrow-${c.polarity})`}
          />
        );
      })}

      {nodes.map((node) => {
        const p = pos.get(node.id)!;
        return (
          <g key={node.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={NODE_R}
              fill="var(--color-surface-2)"
              stroke="var(--color-border)"
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fill="var(--color-text)"
            >
              {node.label.length > 10 ? `${node.label.slice(0, 9)}…` : node.label || '—'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
