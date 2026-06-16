# Decision Log

> Append-only record of significant decisions. Newest first.

## AD-001 — Offline-first architecture
- **Date:** 2026-06-16
- **Decided by:** Founder
- **Decision:** The product must work fully offline. Thinking data (problems, decisions, system maps, reviews) is stored locally on the device and is the source of truth. Any cloud sync is additive and optional, never required for daily use.
- **Consequences:**
  - Local-first data store required (e.g. IndexedDB / SQLite-class).
  - App shell must load and function with no network.
  - The AI Coach (LLM-backed) requires connectivity → must degrade gracefully: queue requests, allow full manual workflows without AI, never block core use on AI.
  - Influences packaging choice (PWA vs desktop) — see AD-002.
- **Status:** Accepted

## AD-002 — Technology stack
- **Date:** 2026-06-16
- **Status:** **Open**
- **Context:** Must satisfy AD-001 (offline-first) and the design goals (calm, fast, premium — Linear/Raycast/Notion/Vercel). To be resolved in `04-system-architecture.md`.
