import { describe, it, expect } from 'vitest';
import type { Decision, Experiment } from '@/domain/types';
import {
  weekRangeFor,
  previousRange,
  computeInsights,
  type Artifacts,
} from './patterns';

function decision(over: Partial<Decision> = {}): Decision {
  return {
    id: 'd1',
    title: 'A decision',
    context: '',
    options: [],
    chosenOption: 'x',
    reasoning: '',
    confidence: 'medium',
    expectedOutcome: '',
    actualOutcome: '',
    status: 'open',
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

function experiment(over: Partial<Experiment> = {}): Experiment {
  return {
    id: 'e1',
    title: 'An experiment',
    technique: 'assumptions',
    subject: '',
    assumptionChallenges: [],
    fundamentals: [],
    reconstruction: '',
    constraintsToDrop: [],
    reimagined: '',
    insight: '',
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

function artifacts(over: Partial<Artifacts> = {}): Artifacts {
  return { problems: [], decisions: [], systemMaps: [], experiments: [], ...over };
}

describe('weekRangeFor', () => {
  it('anchors to Monday and spans exactly 7 days regardless of which day "today" is', () => {
    const sunday = new Date(2026, 5, 14); // Sun 2026-06-14
    const r = weekRangeFor(0, sunday);
    expect(r.start).toBe('2026-06-08'); // the Monday of that week
    expect(r.end).toBe('2026-06-15'); // exclusive next Monday
  });

  it('shifts whole weeks by the offset', () => {
    const wed = new Date(2026, 5, 17); // Wed 2026-06-17
    expect(weekRangeFor(0, wed).start).toBe('2026-06-15');
    expect(weekRangeFor(-1, wed).start).toBe('2026-06-08');
  });
});

describe('previousRange', () => {
  it('steps both bounds back exactly one week', () => {
    const prev = previousRange({ start: '2026-06-15', end: '2026-06-22' });
    expect(prev).toEqual({ start: '2026-06-08', end: '2026-06-15' });
  });
});

describe('computeInsights', () => {
  const range = weekRangeFor(0, new Date(2026, 5, 17)); // 2026-06-15 .. 2026-06-22
  const inWeek = new Date(2026, 5, 16).getTime(); // Tue in-range
  const lastWeek = new Date(2026, 5, 9).getTime(); // prior week

  it('flags a quiet week when nothing was created', () => {
    const ins = computeInsights(artifacts(), range);
    expect(ins.counts.total).toBe(0);
    expect(ins.patterns.map((p) => p.id)).toContain('quiet-week');
  });

  it('counts this week vs the prior week separately', () => {
    const ins = computeInsights(
      artifacts({ decisions: [decision({ createdAt: inWeek }), decision({ id: 'd2', createdAt: lastWeek })] }),
      range,
    );
    expect(ins.counts.decisions).toBe(1);
    expect(ins.prevCounts.decisions).toBe(1);
  });

  it('flags open prediction loops across all time (expected set, actual empty)', () => {
    const ins = computeInsights(
      artifacts({ decisions: [decision({ status: 'open', expectedOutcome: 'win', actualOutcome: '' })] }),
      range,
    );
    expect(ins.patterns.map((p) => p.id)).toContain('open-loops');
  });

  it('notices a single-lens week in the lab', () => {
    const ins = computeInsights(
      artifacts({
        experiments: [
          experiment({ id: 'e1', technique: 'assumptions', createdAt: inWeek }),
          experiment({ id: 'e2', technique: 'assumptions', createdAt: inWeek }),
        ],
      }),
      range,
    );
    expect(ins.patterns.map((p) => p.id)).toContain('single-lens');
  });

  it('never emits a numeric score — only descriptive tones', () => {
    const ins = computeInsights(artifacts({ decisions: [decision({ createdAt: inWeek })] }), range);
    for (const p of ins.patterns) {
      expect(['neutral', 'attention', 'positive']).toContain(p.tone);
    }
  });
});
