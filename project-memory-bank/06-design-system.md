# Design System

Inspiration: **Linear, Raycast, Notion, Vercel.** Feel: calm, focused, premium, fast, minimal. The interface should disappear so the *thinking* is foreground.

## Principles
1. **The session is the hero.** On open, show the workout — never analytics or dashboards first.
2. **Calm over loud.** No bright colors, no badges, no streak confetti, no artificial engagement.
3. **Fast & quiet.** Instant interactions (local-first helps). Motion is subtle and purposeful.
4. **Content-first typography.** Reading and writing thinking is the core activity.
5. **Explainable, never decorative.** Every insight shows its reasoning; nothing is there just to look smart.

## Color & Theme
- **Dark-first**, neutral grayscale base (near-black background, layered gray surfaces), with **one restrained accent** for focus/action.
- Light theme as a peer, same restraint.
- Semantic colors (success/warn/risk) muted, used sparingly — never as gamification.
- Tokens (to formalize in code): `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--accent`.

## Typography
- UI/sans: Inter (or system stack) — tight, legible, modern.
- Writing surfaces: comfortable line-height, generous measure for long-form thinking.
- Clear type scale; few sizes; weight + spacing carry hierarchy, not color.

## Spacing & Layout
- Generous whitespace; a single focused column for sessions.
- 4px spacing base; consistent rhythm.
- Keyboard-first (Raycast/Linear DNA): command palette, shortcuts for everything.

## Components (initial inventory)
- App shell (minimal left rail or palette-driven nav)
- Session prompt / writing surface
- Workspace canvas (problem tree, system map, assumption list)
- Decision record card (reasoning + confidence)
- Insight panel (evidence + reasoning + suggested improvement)
- Empty states that invite thinking, not nag.

## Motion
- Subtle, fast (120–200ms), ease-out. Used for focus transitions and reveals only. No bounce, no spectacle.

## Screen Inventory (maps to system primary screens)
1. Today's Thinking Session  *(home)*
2. Problem Framing Workspace
3. Systems Thinking Workspace
4. Decision Journal
5. Innovation Lab
6. Weekly Review
7. Cognitive Repository
8. Settings
