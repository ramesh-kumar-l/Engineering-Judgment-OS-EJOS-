import { useEffect, useState } from 'react';

/** Quiet indicator. Reassures that the app works offline (AD-001). */
export function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`}
      />
      {online ? 'Online' : 'Offline · saved locally'}
    </div>
  );
}
