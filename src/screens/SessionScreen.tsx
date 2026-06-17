import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@/domain/types';
import { getOrCreateTodaySession, updateSessionStatement } from '@/db/repository';
import { Button, TextArea } from '@/components/ui';

// Home. The session is the hero — no dashboards first (06-design-system.md).
export function SessionScreen() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [statement, setStatement] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getOrCreateTodaySession().then((s) => {
      setSession(s);
      setStatement(s.problemStatement);
    });
  }, []);

  // Debounced local save.
  useEffect(() => {
    if (!session) return;
    if (statement === session.problemStatement) return;
    const t = setTimeout(async () => {
      await updateSessionStatement(session.id, statement);
      setSession({ ...session, problemStatement: statement });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 600);
    return () => clearTimeout(t);
  }, [statement, session]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-8 py-16">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">{today}</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        What problem are you thinking about today?
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Frame it before you solve it. Just write — it saves locally as you go.
      </p>

      <div className="mt-6">
        <TextArea
          autoFocus
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Describe the problem, the context, and why it matters…"
          className="min-h-40 text-base"
        />
        <div className="mt-1 h-4 text-xs text-[var(--color-text-muted)]">
          {saved ? 'Saved locally' : ''}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={() => navigate('/framing')}>Frame this problem →</Button>
        <Button variant="ghost" onClick={() => navigate('/decisions')}>
          Record a decision
        </Button>
      </div>
    </div>
  );
}
