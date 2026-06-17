import { NavLink, Outlet } from 'react-router-dom';
import { OfflineBadge } from './OfflineBadge';

const nav = [
  { to: '/', label: 'Today', end: true },
  { to: '/framing', label: 'Problem Framing', end: false },
  { to: '/systems', label: 'Systems Thinking', end: false },
  { to: '/decisions', label: 'Decision Journal', end: false },
  { to: '/lab', label: 'Innovation Lab', end: false },
  { to: '/review', label: 'Weekly Review', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export function AppShell() {
  return (
    <div className="flex h-full">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5">
        <div className="px-2 pb-6">
          <div className="text-sm font-semibold tracking-tight">EJOS</div>
          <div className="text-xs text-[var(--color-text-muted)]">Engineering Judgment OS</div>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-2 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <OfflineBadge />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
