import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { saveReview } from '@/db/repository';
import type { Review } from '@/domain/types';
import {
  computeInsights,
  rangeLabel,
  summaryText,
  weekRangeFor,
  type Artifacts,
} from '@/review/patterns';
import { PatternList } from '@/review/PatternList';
import { Button, Field, ScreenHeader, TextArea } from '@/components/ui';
import { CoachPanel } from '@/components/CoachPanel';

// Phase 5 — Weekly Review. Pattern detection runs locally over all artifacts;
// the founder's reflection (notes + insight) is the durable growth record.
export function WeeklyReviewScreen() {
  const [offset, setOffset] = useState(0); // 0 = this week, -1 = last week
  const range = useMemo(() => weekRangeFor(offset), [offset]);

  const data = useLiveQuery<Artifacts>(
    async () => ({
      problems: await db.problems.toArray(),
      decisions: await db.decisions.toArray(),
      systemMaps: await db.systemMaps.toArray(),
      experiments: await db.experiments.toArray(),
    }),
    [],
  );
  const review = useLiveQuery(() => db.reviews.get(range.start), [range.start]);

  const insights = useMemo(
    () => (data ? computeInsights(data, range) : null),
    [data, range],
  );

  // Lazily upserts the review row on first edit (browsing a week writes nothing).
  const updateReview = (patch: Partial<Review>) =>
    saveReview({
      id: range.start,
      rangeStart: range.start,
      rangeEnd: range.end,
      notes: review?.notes ?? '',
      insight: review?.insight ?? '',
      createdAt: review?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      ...patch,
    });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-8 py-8">
      <ScreenHeader
        title="Weekly Review"
        subtitle="Step back and look for patterns across the week. The point is to learn, not to score."
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => setOffset((o) => o - 1)}>
              ← Prev
            </Button>
            <Button variant="ghost" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0}>
              Next →
            </Button>
          </div>
        }
      />

      <div className="text-xs font-medium text-[var(--color-text-muted)]">
        Week of {rangeLabel(range)}
        {offset === 0 && ' · current week'}
      </div>

      {insights && <PatternList insights={insights} />}

      <div className="flex flex-col gap-5 border-t border-[var(--color-border)] pt-6">
        <Field label="What stood out" hint="The moment, decision, or surprise that mattered most this week.">
          <TextArea
            value={review?.notes ?? ''}
            onChange={(e) => updateReview({ notes: e.target.value })}
            placeholder="Looking at the patterns above — what do you actually notice about how you thought this week?"
          />
        </Field>

        <Field label="Carrying forward" hint="One thing you'll do differently — a habit, a question to ask, a loop to close.">
          <TextArea
            value={review?.insight ?? ''}
            onChange={(e) => updateReview({ insight: e.target.value })}
            placeholder="What's the one bet for next week?"
          />
        </Field>
      </div>

      {insights && (
        <CoachPanel
          target={{
            kind: 'review',
            data: {
              id: range.start,
              summary: summaryText(insights),
              notes: review?.notes ?? '',
              insight: review?.insight ?? '',
            },
          }}
        />
      )}
    </div>
  );
}
