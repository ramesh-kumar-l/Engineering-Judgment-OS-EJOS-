// Cognitive Repository (Phase 6) — pure, offline normalization + search.
// Flattens every artifact into a common ArtifactRef so search and the thinking
// graph can treat them uniformly. No I/O, no scores.
import type {
  ArtifactKind,
  Session,
  Problem,
  Decision,
  SystemMap,
  Experiment,
  Review,
} from '@/domain/types';

export interface AllArtifacts {
  sessions: Session[];
  problems: Problem[];
  decisions: Decision[];
  systemMaps: SystemMap[];
  experiments: Experiment[];
  reviews: Review[];
}

/** A uniform, display-ready handle on any artifact. */
export interface ArtifactRef {
  kind: ArtifactKind;
  id: string;
  title: string; // best available label
  snippet: string; // short context line
  text: string; // full searchable haystack (lowercased)
  updatedAt: number;
  route: string; // where to view its workspace
}

export const KIND_LABEL: Record<ArtifactKind, string> = {
  session: 'Session',
  problem: 'Problem',
  decision: 'Decision',
  systemMap: 'System Map',
  experiment: 'Experiment',
  review: 'Weekly Review',
};

/** A stable key for a (kind, id) pair — used to look refs up by connection ends. */
export const refKey = (kind: ArtifactKind, id: string): string => `${kind}:${id}`;

function clip(s: string, n: number): string {
  const t = (s ?? '').trim().replace(/\s+/g, ' ');
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function make(
  kind: ArtifactKind,
  id: string,
  rawTitle: string,
  rawSnippet: string,
  parts: string[],
  updatedAt: number,
  route: string,
): ArtifactRef {
  return {
    kind,
    id,
    title: clip(rawTitle, 80) || `Untitled ${KIND_LABEL[kind]}`,
    snippet: clip(rawSnippet, 120),
    text: parts.join(' ').toLowerCase(),
    updatedAt,
    route,
  };
}

/** Flatten all artifacts into a single list of refs. */
export function collectArtifacts(a: AllArtifacts): ArtifactRef[] {
  const refs: ArtifactRef[] = [];

  for (const s of a.sessions) {
    refs.push(make('session', s.id, `Session · ${s.date}`, s.problemStatement, [s.date, s.problemStatement], s.updatedAt, '/'));
  }
  for (const p of a.problems) {
    refs.push(make('problem', p.id, p.title, p.statement, [p.title, p.statement, ...p.assumptions, ...p.stakeholders, p.rootCauseNotes], p.updatedAt, '/framing'));
  }
  for (const d of a.decisions) {
    refs.push(make('decision', d.id, d.title || d.chosenOption, d.context, [d.title, d.context, ...d.options, d.chosenOption, d.reasoning, d.expectedOutcome, d.actualOutcome], d.updatedAt, '/decisions'));
  }
  for (const m of a.systemMaps) {
    refs.push(make('systemMap', m.id, m.title, m.description, [m.title, m.description, ...m.nodes.map((n) => n.label), ...m.feedbackLoops, ...m.leveragePoints, m.reflection], m.updatedAt, '/systems'));
  }
  for (const e of a.experiments) {
    refs.push(make('experiment', e.id, e.title || e.subject, e.subject, [e.title, e.subject, e.reconstruction, e.reimagined, e.insight, ...e.fundamentals, ...e.constraintsToDrop, ...e.assumptionChallenges.flatMap((c) => [c.assumption, c.challenge])], e.updatedAt, '/lab'));
  }
  for (const r of a.reviews) {
    refs.push(make('review', r.id, `Week of ${r.rangeStart}`, r.notes, [r.notes, r.insight], r.updatedAt, '/review'));
  }

  return refs;
}

/** AND-match every whitespace-separated term against each ref's haystack.
 *  Empty query returns nothing (the screen shows guidance instead). */
export function searchArtifacts(refs: ArtifactRef[], query: string): ArtifactRef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return refs
    .filter((r) => terms.every((t) => r.text.includes(t)))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Index refs by their (kind, id) key for O(1) lookup from connections. */
export function indexByKey(refs: ArtifactRef[]): Map<string, ArtifactRef> {
  return new Map(refs.map((r) => [refKey(r.kind, r.id), r]));
}
