import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level safety net. A render error in any screen would otherwise white-screen
 * the whole offline app; this catches it and offers recovery. Intentionally
 * self-contained (no app-code imports) so the same failure can't take it down too.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Local-only: surface in the console for the founder; nothing leaves the device.
    console.error('EJOS render error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.assign('/');
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h1 className="text-base font-semibold tracking-tight">Something broke on this screen</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Your work is saved locally — this only interrupted the view. Reloading should bring you
            back to a working state.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded-md bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-text-muted)]">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-4 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Reload EJOS
          </button>
        </div>
      </div>
    );
  }
}
