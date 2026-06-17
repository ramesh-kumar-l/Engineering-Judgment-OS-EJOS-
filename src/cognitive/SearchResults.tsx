// Presentational search results (Phase 6). Each hit links to its workspace.
import { Link } from 'react-router-dom';
import { KIND_LABEL, type ArtifactRef } from './artifacts';

export function SearchResults({ query, results }: { query: string; results: ArtifactRef[] }) {
  if (!query.trim()) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Search across every problem, decision, system map, experiment, and review you've captured.
      </p>
    );
  }

  if (results.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">No artifacts match "{query}".</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs text-[var(--color-text-muted)]">
        {results.length} {results.length === 1 ? 'match' : 'matches'}
      </div>
      {results.map((r) => (
        <Link
          key={`${r.kind}:${r.id}`}
          to={r.route}
          className="flex flex-col gap-0.5 rounded-md bg-[var(--color-surface)] px-3 py-2 transition-colors hover:bg-[var(--color-surface-2)]"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {KIND_LABEL[r.kind]}
            </span>
            <span className="text-sm font-medium text-[var(--color-text)]">{r.title}</span>
          </div>
          {r.snippet && (
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">{r.snippet}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
