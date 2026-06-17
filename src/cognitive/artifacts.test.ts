import { describe, it, expect } from 'vitest';
import type { Problem, Decision, Session } from '@/domain/types';
import {
  collectArtifacts,
  searchArtifacts,
  refKey,
  indexByKey,
  type AllArtifacts,
} from './artifacts';

// Minimal typed factories — only the fields a test cares about; the rest default.
function problem(over: Partial<Problem> = {}): Problem {
  return {
    id: 'p1',
    title: 'Cache invalidation',
    statement: 'Stale reads after deploy',
    assumptions: ['users tolerate 1s staleness'],
    stakeholders: ['on-call'],
    rootCauseNotes: '',
    createdAt: 0,
    updatedAt: 100,
    ...over,
  };
}

function decision(over: Partial<Decision> = {}): Decision {
  return {
    id: 'd1',
    title: 'Adopt Redis',
    context: 'Need a shared cache',
    options: ['Redis', 'Memcached'],
    chosenOption: 'Redis',
    reasoning: 'team familiarity',
    confidence: 'medium',
    expectedOutcome: 'lower latency',
    actualOutcome: '',
    status: 'open',
    createdAt: 0,
    updatedAt: 200,
    ...over,
  };
}

function session(over: Partial<Session> = {}): Session {
  return { id: 's1', date: '2026-06-15', problemStatement: 'latency budget', createdAt: 0, updatedAt: 50, ...over };
}

function allOf(over: Partial<AllArtifacts> = {}): AllArtifacts {
  return { sessions: [], problems: [], decisions: [], systemMaps: [], experiments: [], reviews: [], ...over };
}

describe('collectArtifacts', () => {
  it('normalizes every artifact into a uniform ref with the right route', () => {
    const refs = collectArtifacts(allOf({ problems: [problem()], decisions: [decision()], sessions: [session()] }));
    expect(refs).toHaveLength(3);
    expect(refs.find((r) => r.kind === 'problem')?.route).toBe('/framing');
    expect(refs.find((r) => r.kind === 'decision')?.route).toBe('/decisions');
    expect(refs.find((r) => r.kind === 'session')?.route).toBe('/');
  });

  it('falls back to a labelled title when none is set', () => {
    const refs = collectArtifacts(allOf({ problems: [problem({ title: '' })] }));
    expect(refs[0].title).toBe('Untitled Problem');
  });

  it('builds a lowercased haystack spanning secondary fields', () => {
    const refs = collectArtifacts(allOf({ problems: [problem()] }));
    expect(refs[0].text).toContain('on-call'); // a stakeholder, not the title
    expect(refs[0].text).toBe(refs[0].text.toLowerCase());
  });
});

describe('searchArtifacts', () => {
  const refs = collectArtifacts(allOf({ problems: [problem()], decisions: [decision()] }));

  it('returns nothing for an empty query', () => {
    expect(searchArtifacts(refs, '   ')).toEqual([]);
  });

  it('AND-matches every term (a term in a different artifact excludes the hit)', () => {
    expect(searchArtifacts(refs, 'redis')).toHaveLength(1);
    expect(searchArtifacts(refs, 'redis cache')).toHaveLength(1); // both in the decision
    expect(searchArtifacts(refs, 'redis stale')).toHaveLength(0); // split across two artifacts
  });

  it('is case-insensitive and sorts newest-first', () => {
    const hits = searchArtifacts(refs, 'CACHE'); // problem (updatedAt 100) + decision (200)
    expect(hits).toHaveLength(2);
    expect(hits[0].updatedAt).toBeGreaterThan(hits[1].updatedAt);
  });
});

describe('refKey / indexByKey', () => {
  it('round-trips a (kind, id) lookup', () => {
    const refs = collectArtifacts(allOf({ decisions: [decision({ id: 'd9' })] }));
    const map = indexByKey(refs);
    expect(map.get(refKey('decision', 'd9'))?.id).toBe('d9');
    expect(map.get(refKey('problem', 'd9'))).toBeUndefined();
  });
});
