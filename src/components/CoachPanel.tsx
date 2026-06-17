import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { getAISettings, saveCoaching } from '@/db/repository';
import { runCoaching } from '@/ai/coach';
import type { CoachTarget } from '@/ai/prompts';
import { Button } from '@/components/ui';

// Reusable AI Coach panel, dropped at the bottom of each artifact editor.
// The coach surfaces blind spots — it never grades or scores (Phase 3 / AD-004).
export function CoachPanel({ target }: { target: CoachTarget }) {
  const id = target.data.id;
  const saved = useLiveQuery(() => db.coachings.get(id), [id]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getAISettings();
      const content = await runCoaching(settings, target);
      await saveCoaching({
        id,
        targetKind: target.kind,
        content,
        provider: settings.provider,
        model: settings[`${settings.provider}Model` as 'claudeModel' | 'geminiModel' | 'ollamaModel'],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Coaching failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          AI Coach {saved ? `· ${saved.provider} / ${saved.model}` : ''}
        </span>
        <Button variant="ghost" onClick={run} disabled={loading}>
          {loading ? 'Thinking…' : saved ? 'Refresh coaching' : 'Get coaching'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}{' '}
          <a href="/settings" className="underline">
            Check Settings
          </a>
        </p>
      )}

      {!error && !saved && !loading && (
        <p className="text-sm text-[var(--color-text-muted)]">
          Ask the coach to surface blind spots, missing assumptions, and second-order effects. It
          asks questions — it never grades.
        </p>
      )}

      {saved && (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">
          {saved.content}
        </div>
      )}
    </div>
  );
}
