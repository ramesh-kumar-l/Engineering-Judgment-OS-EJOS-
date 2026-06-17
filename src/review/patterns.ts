// Phase 5 — Weekly Review pattern detection. Pure functions, no I/O.
// Runs fully offline over local artifacts. Findings are descriptive prompts
// and questions — never a grade, ranking, or numeric score (design rule).
import type { ISODate, Problem, Decision, SystemMap, Experiment } from '@/domain/types';

export interface WeekRange {
  start: ISODate; // inclusive — Monday, 'YYYY-MM-DD'
  end: ISODate; // exclusive — the next Monday
}

export interface Artifacts {
  problems: Problem[];
  decisions: Decision[];
  systemMaps: SystemMap[];
  experiments: Experiment[];
}

export type PatternTone = 'neutral' | 'attention' | 'positive';

/** A single detected pattern: an observation plus a question to act on. */
export interface ReviewPattern {
  id: string;
  title: string;
  detail: string;
  tone: PatternTone;
}

export interface PeriodCounts {
  problems: number;
  decisions: number;
  systemMaps: number;
  experiments: number;
  total: number;
}

export interface ReviewInsights {
  range: WeekRange;
  counts: PeriodCounts;
  prevCounts: PeriodCounts;
  confidenceMix: { low: number; medium: number; high: number };
  recurringThemes: string[];
  patterns: ReviewPattern[];
}

const iso = (d: Date): ISODate => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Monday-anchored week. offset 0 = this week, -1 = last week, etc. */
export function weekRangeFor(offset: number, today = new Date()): WeekRange {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dow = (d.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow + offset * 7);
  const next = new Date(monday);
  next.setDate(monday.getDate() + 7);
  return { start: iso(monday), end: iso(next) };
}

export function previousRange(r: WeekRange): WeekRange {
  const s = new Date(`${r.start}T00:00:00`);
  s.setDate(s.getDate() - 7);
  const e = new Date(`${r.end}T00:00:00`);
  e.setDate(e.getDate() - 7);
  return { start: iso(s), end: iso(e) };
}

/** Human label like "Jun 9 – Jun 15". end is exclusive, so show end-1 day. */
export function rangeLabel(r: WeekRange): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = new Date(`${r.start}T00:00:00`);
  const last = new Date(`${r.end}T00:00:00`);
  last.setDate(last.getDate() - 1);
  return `${start.toLocaleDateString(undefined, opts)} – ${last.toLocaleDateString(undefined, opts)}`;
}

const startMs = (r: WeekRange) => new Date(`${r.start}T00:00:00`).getTime();
const endMs = (r: WeekRange) => new Date(`${r.end}T00:00:00`).getTime();
const inRange = (ts: number, r: WeekRange) => ts >= startMs(r) && ts < endMs(r);

interface Window {
  problems: Problem[];
  decisions: Decision[];
  systemMaps: SystemMap[];
  experiments: Experiment[];
}

function windowFor(a: Artifacts, r: WeekRange): Window {
  return {
    problems: a.problems.filter((p) => inRange(p.createdAt, r)),
    decisions: a.decisions.filter((d) => inRange(d.createdAt, r)),
    systemMaps: a.systemMaps.filter((m) => inRange(m.createdAt, r)),
    experiments: a.experiments.filter((e) => inRange(e.createdAt, r)),
  };
}

function countsOf(w: Window): PeriodCounts {
  const total = w.problems.length + w.decisions.length + w.systemMaps.length + w.experiments.length;
  return {
    problems: w.problems.length,
    decisions: w.decisions.length,
    systemMaps: w.systemMaps.length,
    experiments: w.experiments.length,
    total,
  };
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'about',
  'what', 'when', 'will', 'should', 'could', 'have', 'more', 'than', 'them',
  'they', 'our', 'how', 'why', 'are', 'was', 'not', 'but', 'can', 'new',
]);

// Words appearing across 2+ distinct artifacts in the window — a recurring thread.
function recurringThemes(w: Window): string[] {
  const texts: string[] = [
    ...w.problems.map((p) => `${p.title} ${p.statement}`),
    ...w.decisions.map((d) => `${d.title} ${d.context}`),
    ...w.systemMaps.map((m) => `${m.title} ${m.description}`),
    ...w.experiments.map((e) => `${e.title} ${e.subject}`),
  ];
  const docFreq = new Map<string, number>();
  for (const text of texts) {
    const seen = new Set<string>();
    for (const raw of text.toLowerCase().split(/[^a-z]+/)) {
      if (raw.length < 4 || STOPWORDS.has(raw) || seen.has(raw)) continue;
      seen.add(raw);
      docFreq.set(raw, (docFreq.get(raw) ?? 0) + 1);
    }
  }
  return [...docFreq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
}

export function computeInsights(a: Artifacts, range: WeekRange): ReviewInsights {
  const win = windowFor(a, range);
  const prev = windowFor(a, previousRange(range));
  const counts = countsOf(win);
  const prevCounts = countsOf(prev);

  const confidenceMix = win.decisions.reduce(
    (acc, d) => ({ ...acc, [d.confidence]: acc[d.confidence] + 1 }),
    { low: 0, medium: 0, high: 0 },
  );
  const themes = recurringThemes(win);

  const patterns: ReviewPattern[] = [];

  // Activity / growth trend vs. the prior week.
  if (counts.total === 0) {
    patterns.push({
      id: 'quiet-week',
      title: 'A quiet week',
      detail:
        'No artifacts created this week. Judgment is a practice — a single problem-framing is a good way to restart the habit.',
      tone: 'attention',
    });
  } else {
    const delta = counts.total - prevCounts.total;
    const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'level';
    patterns.push({
      id: 'activity',
      title: 'Thinking volume',
      detail:
        `You created ${counts.total} artifact${counts.total === 1 ? '' : 's'} this week ` +
        `(${prevCounts.total} the week before — ${dir}). ` +
        'Volume isn’t the point; is the depth where you want it?',
      tone: 'positive',
    });
  }

  // Decisions awaiting a real outcome — across all time, not just this week.
  const awaiting = a.decisions.filter(
    (d) => d.status === 'open' && d.expectedOutcome.trim() && !d.actualOutcome.trim(),
  );
  if (awaiting.length) {
    patterns.push({
      id: 'open-loops',
      title: 'Predictions still open',
      detail:
        `${awaiting.length} decision${awaiting.length === 1 ? '' : 's'} you made earlier ` +
        'still has no actual outcome recorded. Closing these loops is where judgment compounds — ' +
        'which one can you check now?',
      tone: 'attention',
    });
  }

  // Confidence shape this week — a mirror, not a verdict.
  if (win.decisions.length >= 2) {
    const { low, medium, high } = confidenceMix;
    if (high >= low + medium && high > 0) {
      patterns.push({
        id: 'confidence-high',
        title: 'Mostly high confidence',
        detail:
          `${high} of ${win.decisions.length} decisions this week were high-confidence. ` +
          'Which one would cost the most if you turned out to be wrong?',
        tone: 'neutral',
      });
    } else if (low >= high + medium && low > 0) {
      patterns.push({
        id: 'confidence-low',
        title: 'A lot of low confidence',
        detail:
          `${low} of ${win.decisions.length} decisions this week were low-confidence. ` +
          'What would the cheapest experiment be to raise your confidence on one of them?',
        tone: 'neutral',
      });
    }
  }

  // Lens variety in the Innovation Lab.
  if (win.experiments.length >= 2) {
    const lenses = new Set(win.experiments.map((e) => e.technique));
    if (lenses.size === 1) {
      patterns.push({
        id: 'single-lens',
        title: 'One lens this week',
        detail:
          'Every experiment used the same lens. A different lens (first-principles vs. redesign vs. ' +
          'challenging assumptions) tends to break a different kind of anchor — worth a try.',
        tone: 'neutral',
      });
    }
  }

  // Recurring threads across artifacts.
  if (themes.length) {
    patterns.push({
      id: 'themes',
      title: 'A recurring thread',
      detail:
        `These words keep surfacing across your work: ${themes.join(', ')}. ` +
        'Is there one underlying problem you keep circling — and is it framed yet?',
      tone: 'neutral',
    });
  }

  return { range, counts, prevCounts, confidenceMix, recurringThemes: themes, patterns };
}

/** Plain-text digest handed to the AI coach (offline-safe; no scores). */
export function summaryText(ins: ReviewInsights): string {
  const c = ins.counts;
  const lines = [
    `Week of ${rangeLabel(ins.range)}.`,
    `Created this week: ${c.problems} problem framings, ${c.decisions} decisions, ` +
      `${c.systemMaps} system maps, ${c.experiments} experiments ` +
      `(prior week total: ${ins.prevCounts.total}).`,
    `Decision confidence this week — low: ${ins.confidenceMix.low}, ` +
      `medium: ${ins.confidenceMix.medium}, high: ${ins.confidenceMix.high}.`,
  ];
  if (ins.recurringThemes.length) lines.push(`Recurring words: ${ins.recurringThemes.join(', ')}.`);
  if (ins.patterns.length) {
    lines.push('Patterns I detected locally:');
    for (const p of ins.patterns) lines.push(`- ${p.title}: ${p.detail}`);
  }
  return lines.join('\n');
}
