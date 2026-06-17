// Presentational view of the locally-computed weekly insights (Phase 5).
// Pure display — no I/O, no scores. Tones are color cues, not rankings.
import type { ReviewInsights, PatternTone } from './patterns';

const toneClasses: Record<PatternTone, string> = {
  positive: 'border-l-2 border-l-emerald-500/60',
  attention: 'border-l-2 border-l-amber-500/70',
  neutral: 'border-l-2 border-l-[var(--color-border)]',
};

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-[var(--color-surface-2)] px-3 py-2">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}

export function PatternList({ insights }: { insights: ReviewInsights }) {
  const c = insights.counts;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CountTile label="Problems framed" value={c.problems} />
        <CountTile label="Decisions" value={c.decisions} />
        <CountTile label="System maps" value={c.systemMaps} />
        <CountTile label="Experiments" value={c.experiments} />
      </div>

      {insights.patterns.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Nothing notable detected for this week yet — capture some thinking, then come back.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {insights.patterns.map((p) => (
            <div
              key={p.id}
              className={`rounded-md bg-[var(--color-surface)] py-2.5 pl-3 pr-3 ${toneClasses[p.tone]}`}
            >
              <div className="text-sm font-medium text-[var(--color-text)]">{p.title}</div>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{p.detail}</p>
            </div>
          ))}
        </div>
      )}

      {insights.recurringThemes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)]">Recurring:</span>
          {insights.recurringThemes.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
