# Architecture: Database Schema

Local-first (AD-001). IndexedDB via **Dexie**. Source of truth; no network dependency.
Implemented in `src/db/database.ts`; access via `src/db/repository.ts` (the only module that owns persistence).

## Dexie v1 stores
```ts
db.version(1).stores({
  sessions:  'id, date, updatedAt',
  problems:  'id, sessionId, updatedAt',
  decisions: 'id, sessionId, status, updatedAt',
});
```
- Primary key `id` is a `crypto.randomUUID()` string.
- Indexed fields enable: today's session lookup by `date`, lists ordered by `updatedAt`, decisions filtered by `status`.
- Reactive reads in the UI use `dexie-react-hooks` `useLiveQuery`.

## Migration policy
- Bump `db.version(n)` with an `.upgrade()` when entities change. Never destructive without an export path (data is the user's judgment history).
