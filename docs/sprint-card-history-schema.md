# User-profile and analysis-history schema

**Type:** Database / backend · **Size:** M · **Priority:** High — Sprint 3's history feature is built on top of this, so it blocks that work.

## First: "restore history" is the wrong framing

There is no history to restore. The legacy production database contained exactly **three** tables — `word`, `user`, `recovery` — confirmed against the dump at `~/virs-production-backup.sql`. The old app analyzed a passage, returned the result, and kept nothing.

So this is a **net-new feature**, not a recovery. Worth correcting with the professor and product owner before Sprint 3, because "restore" implies data exists that could be brought back, and it doesn't. Nothing was lost in the migration.

## The design decision that matters

**Store the computed result, not just the input text.**

Admins can edit the word lists at any time. If history re-runs the analysis when a user opens it, a passage analyzed today will silently show different numbers next month, and a student's saved work changes under them. History has to be a snapshot of what the analyzer said *at the time*.

That also means history stays readable after the ranking algorithm is swapped out — the other team's context-based ranking will change results for new analyses without rewriting old ones.

## Proposed schema

A new `packages/db/src/schema/history.ts`:

**`analysis`**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid, pk | |
| `user_id` | text → `user.id`, **cascade delete** | Nullable: anonymous analysis is allowed today and should stay allowed |
| `created_at` | timestamptz, default now | |
| `source_kind` | text enum: `text` \| `pdf` \| `document` \| `image` | Which entry point produced it |
| `title` | text, nullable | User-editable label; defaults to a truncated first line |
| `input_text` | text | The extracted text that was analyzed |
| `sentence_count` | integer | |
| `flesch_reading_score` | real | |
| `statistics` | jsonb | The full `TextStatistics` — per-category counts and percentages |
| `word_matches` | jsonb | The `WordMatch[]` snapshot, including paragraph-break markers |

Indexes: `(user_id, created_at desc)` for the list view.

`statistics` and `word_matches` are `jsonb` deliberately — they are a snapshot for display, never queried field-by-field. A normalized `analysis_word` table would mean thousands of rows per passage for no benefit.

**Cascade delete matters:** account deletion is already a supported feature (`deleteUser` is enabled in Better Auth), so history must not outlive its owner.

## Also missing from the user profile

Two columns existed in the legacy `user` table and were not carried over:

- `invalid_login_attempts` (smallint)
- `locked` (bit)

The old app locked an account after repeated failed logins. The new app does not. Decide whether to reinstate this — and note that it partly overlaps with the rate-limit defect below.

Everything else on the legacy user record **was** migrated: `full_name` → `name`, `user_name` → `username`, `user_level` → `user_level`, `email`, `creation_date` → `created_at`.

## Related defect worth fixing in the same pass

`apps/virs/src/lib/auth.ts` sets `rateLimit: { enabled: true, storage: "memory" }`. On Vercel, every serverless instance has its own memory and it resets on cold start, so rate limiting is effectively absent in production while appearing enabled. Switch to `storage: "database"`, which needs its own table — hence doing it alongside this migration.

## Scope

1. Add the `analysis` table to `packages/db/src/schema/history.ts`, export it from `schema/index.ts`
2. `pnpm --filter @repo/db db:generate` and **commit the generated migration**
3. Query helpers in `packages/db/src/queries/history.ts`: `recordAnalysis`, `listUserAnalyses` (paginated), `getAnalysis`, `deleteAnalysis` — every read scoped by `user_id`
4. Zod schemas in `packages/core/src/schemas.ts` for the API surface
5. Apply to Neon `production` — **run against a Neon branch first**, not straight at production
6. Decide on `locked` / `invalid_login_attempts`
7. Switch Better Auth rate limiting to database storage

## Done when

- Migration is committed and applied; `analysis` exists in Neon `production`
- An analysis can be saved and listed back for a signed-in user, and anonymous analysis still works
- Deleting an account removes its history
- Reading someone else's analysis by id returns 404, not 403 — do not confirm the row exists
- `pnpm turbo run check-types lint test build` passes

## Explicitly not in scope

The history **UI**. This card delivers the schema and queries Sprint 3 builds on. Note that the Mantine screens do not include a history view either, so Sprint 3 needs both the API surface and a new screen.
