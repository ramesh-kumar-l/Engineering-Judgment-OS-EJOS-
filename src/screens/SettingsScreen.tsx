import { useEffect, useState } from 'react';
import type { AISettings, ProviderId } from '@/ai/types';
import { DEFAULT_AI_SETTINGS } from '@/ai/types';
import { getProvider } from '@/ai/providers';
import { getAISettings, saveAISettings } from '@/db/repository';
import { seedGoldenExamples, removeGoldenExamples, hasGoldenExamples } from '@/db/seed';
import { Button, Field, ScreenHeader, TextInput } from '@/components/ui';

const providers: { id: ProviderId; label: string; note: string }[] = [
  { id: 'claude', label: 'Claude', note: 'Anthropic API · online' },
  { id: 'gemini', label: 'Gemini', note: 'Google API · online' },
  { id: 'ollama', label: 'Ollama', note: 'Local model · works offline' },
];

export function SettingsScreen() {
  const [s, setS] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [test, setTest] = useState<{ state: 'idle' | 'testing' | 'ok' | 'fail'; msg?: string }>({
    state: 'idle',
  });

  const [examples, setExamples] = useState<{ loaded: boolean; busy: boolean }>({
    loaded: false,
    busy: true,
  });

  useEffect(() => {
    getAISettings().then(setS);
    hasGoldenExamples().then((loaded) => setExamples({ loaded, busy: false }));
  }, []);

  const loadExamples = async () => {
    setExamples((e) => ({ ...e, busy: true }));
    await seedGoldenExamples();
    setExamples({ loaded: true, busy: false });
  };

  const clearExamples = async () => {
    setExamples((e) => ({ ...e, busy: true }));
    await removeGoldenExamples();
    setExamples({ loaded: false, busy: false });
  };

  // Save-on-change (local-first, like the rest of the app).
  const update = (patch: Partial<AISettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    setTest({ state: 'idle' });
    void saveAISettings(next);
  };

  const testConnection = async () => {
    setTest({ state: 'testing' });
    try {
      await getProvider(s).check();
      setTest({ state: 'ok', msg: 'Connected.' });
    } catch (e) {
      setTest({ state: 'fail', msg: e instanceof Error ? e.message : 'Failed.' });
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-8 py-8">
      <ScreenHeader
        title="Settings"
        subtitle="Choose how the AI Coach runs. Everything is stored locally on this device."
      />

      <Field label="AI provider">
        <div className="flex flex-col gap-2 sm:flex-row">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => update({ provider: p.id })}
              className={`flex-1 rounded-md border px-3 py-2 text-left transition-colors ${
                s.provider === p.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-surface-2)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              }`}
            >
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{p.note}</div>
            </button>
          ))}
        </div>
      </Field>

      {s.provider === 'claude' && (
        <>
          <Field label="Claude API key" hint="Used directly from the browser; stays on this device.">
            <TextInput
              type="password"
              value={s.claudeApiKey}
              placeholder="sk-ant-…"
              onChange={(e) => update({ claudeApiKey: e.target.value })}
            />
          </Field>
          <Field label="Claude model">
            <TextInput value={s.claudeModel} onChange={(e) => update({ claudeModel: e.target.value })} />
          </Field>
        </>
      )}

      {s.provider === 'gemini' && (
        <>
          <Field label="Gemini API key" hint="Used directly from the browser; stays on this device.">
            <TextInput
              type="password"
              value={s.geminiApiKey}
              placeholder="AIza…"
              onChange={(e) => update({ geminiApiKey: e.target.value })}
            />
          </Field>
          <Field label="Gemini model">
            <TextInput value={s.geminiModel} onChange={(e) => update({ geminiModel: e.target.value })} />
          </Field>
        </>
      )}

      {s.provider === 'ollama' && (
        <>
          <Field
            label="Ollama base URL"
            hint="Start Ollama with OLLAMA_ORIGINS=* so the browser can reach it."
          >
            <TextInput
              value={s.ollamaBaseUrl}
              onChange={(e) => update({ ollamaBaseUrl: e.target.value })}
            />
          </Field>
          <Field label="Ollama model" hint="e.g. qwen3, gemma3 (run `ollama pull <model>` first).">
            <TextInput value={s.ollamaModel} onChange={(e) => update({ ollamaModel: e.target.value })} />
          </Field>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={testConnection} disabled={test.state === 'testing'}>
          {test.state === 'testing' ? 'Testing…' : 'Test connection'}
        </Button>
        {test.state === 'ok' && <span className="text-sm text-emerald-400">{test.msg}</span>}
        {test.state === 'fail' && <span className="text-sm text-red-400">{test.msg}</span>}
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Online providers need a network connection. Ollama runs locally, so the coach works fully
        offline.
      </p>

      <div className="mt-2 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6">
        <Field
          label="Example data"
          hint="Two fully worked walkthroughs — building EJOS itself, and designing an Android fitness tracker — across every screen. Clearly labeled “[Example]” and removable anytime."
        >
          <div className="flex items-center gap-3">
            {examples.loaded ? (
              <Button variant="danger" onClick={clearExamples} disabled={examples.busy}>
                {examples.busy ? 'Working…' : 'Remove example data'}
              </Button>
            ) : (
              <Button onClick={loadExamples} disabled={examples.busy}>
                {examples.busy ? 'Working…' : 'Load golden examples'}
              </Button>
            )}
            {examples.loaded && !examples.busy && (
              <span className="text-sm text-emerald-400">Loaded — explore any screen.</span>
            )}
          </div>
        </Field>
      </div>
    </div>
  );
}
