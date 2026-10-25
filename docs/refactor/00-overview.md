# VIRS app refactor: overview

**Scope:** `apps/virs` only (the Next.js app). `apps/api` and `packages/*` stay as they are, except where a plan says so and you agree.
**Status:** all five plans implemented on 2026-10-18 (uncommitted on `mantine-foundation-refactor`), with the recommended answers to D1–D10, except for these changes made during implementation:

- **D1 changed:** signed-out visitors go to a `/sign-in?title=…&next=…` page (not the log-in pop-up). It shows the shared account forms (`app/_components/account-forms`) and redirects back to `next` (same-site paths only). The `?login=1` / `?register=1` URL pop-ups are gone; `/register` redirects to `/sign-in?view=register`.
- **D10 done:** every client call, including Better Auth forms, goes through `useMutation`/`useQuery` (`AuthError.from` turns Better Auth's `{ error }` into a thrown Error).
- **Plan 5 step 10 skipped:** ESLint here can't parse TypeScript (Babel without the TS/JSX presets), so a `useEffect` lint rule would never run. `grep -rn useEffect src` is the check instead.
- **Plan 4B simplified:** `HttpError` has static factories (`HttpError.badRequest(…)`) instead of one file per factory; `route` is now `apiRoute` (`api-route.ts`).
- The placement rules that ended up in use are in DESIGN.md, "Where files go".

## The five requests, and their plans

| # | Request (summarized) | Plan |
| --- | --- | --- |
| 1 | Components don't know about auth. One app-wide server-side session check at the root, plus a server-side redirect for signed-out visitors. Check that server sessions are set up correctly. | [`01-auth-at-the-root.md`](01-auth-at-the-root.md) |
| 2 | One `error.tsx` for the app, not one per route | [`02-error-boundary.md`](02-error-boundary.md) |
| 3 | Vertical slices: each file as close to its consumers as possible, and only as high up the tree as its importers need. Truly reusable code stays in `src/components`. | [`03-colocation.md`](03-colocation.md) |
| 4 | One export and one component per file. Helpers tied to a component get their own file next to it. | [`04-one-export-per-file.md`](04-one-export-per-file.md) |
| 5 | No `useEffect` for data fetching or for derived values. TanStack Query handles fetching; `apiFetch` stays. | [`05-tanstack-query.md`](05-tanstack-query.md) |

## Implementation order

**2 → 5 → 1 → 3 → 4**, one plan per branch or PR, and run the checks below after each one.

- **2 first.** It's tiny and independent, and plan 1 relies on it: once the root layout reads the session, a failure there has to land somewhere.
- **5 before 1.** Plan 1's `SessionProvider` uses `useQuery` to keep the session alive and to update the Angular `localStorage` keys. That replaces the last two `useEffect`s, so the `QueryClientProvider` from plan 5 has to exist first.
- **1 before 3 and 4.** Plans 1 and 5 delete or rewrite whole components (`SignedOut`, `ProgressGate`'s state type, `useJson`, `useDraft`, the `revision` counter in admin, the `AnalysisProvider`). Moving and splitting files before that would mean moving code that's about to be deleted.
- **3 before 4.** Moving files first (with `git mv`, so history follows) and then splitting them in place keeps each diff readable. If you'd rather touch each file once, do 3 and 4 together one route slice at a time; both plans list slices in the same order.

Each plan writes **current** paths for what it changes. Plan 3 maps every current path to its target, including the files that plans 1, 2 and 5 create.

## Checks after every plan

From the repo root:

```sh
pnpm --filter virs check-types   # next typegen && tsc --noEmit (typedRoutes is on, so moved routes are checked)
pnpm --filter virs lint          # every rule is a warning (eslint-plugin-only-warn); read the output, it never fails
pnpm --filter virs test          # vitest, src/**/*.test.ts
pnpm --filter virs build
```

`lint` also scans the Angular bundle in `public/` and prints about 2,500 warnings from it. Filter to `src/`: `pnpm --filter virs exec eslint src`.

Then click through the app: `pnpm turbo run dev --filter=virs`. Each plan has its own manual checklist.

## Facts this research relied on (versions as installed)

- `next` **16.3.5**, React **19.3.0**, `better-auth` **1.7.4**, Mantine **9.6.1**, TypeScript 7, pnpm 11.
- `apps/virs/AGENTS.md` says this Next version differs from older training data and to read `node_modules/next/dist/docs/`. The guides these plans cite live in `apps/virs/node_modules/next/dist/docs/01-app/`:
  - `02-guides/authentication.md`, especially "Optimistic checks with Proxy", "Creating a Data Access Layer", **"Layouts and auth checks"** and "Auth and streaming"
  - `01-getting-started/16-proxy.md` and `03-api-reference/03-file-conventions/proxy.md`. **In Next 16, `middleware.ts` is called `proxy.ts`** and runs on Node.js.
  - `03-api-reference/03-file-conventions/error.md`. The error component gets **`retry()`** (new; preferred) as well as `reset()`.
  - `01-getting-started/02-project-structure.md`: colocation, `_private` folders, `(route groups)`
  - `02-guides/client-side-data-fetching/tanstack-query.md`
- Better Auth's Next.js guide (better-auth.com/docs/integrations/next) covers `auth.api.getSession({ headers })` in Server Components, `nextCookies()` last, `getSessionCookie()` in `proxy.ts` for cookie-only checks (it doesn't validate the session), and a session check in every page or route as the real gate.
- `@tanstack/react-query` latest is 5.104.4 (2026-10-17). **Pin `5.104.1`** (2026-10-02), which is more than two weeks old.
- The Angular build in `public/` serves every URL that has no Next page (`fallback` rewrite in `next.config.ts`). Proxy runs before rewrites (execution order in the proxy docs), so any proxy matcher must list Mantine pages only.

## Rules that apply to every plan

- **Stay in scope** (standing preference): change only what a plan lists. If you notice something else, write it under that plan's "Noticed, not changed" section; don't fix it.
- **Mantine only** for UI, following `apps/virs/DESIGN.md`: one filled button per area, the main action on the right, Alerts with icons, and plain words.
- **Code style:** semicolons, double quotes and long lines, like the rest of `src/`. There is no Prettier config, so `pnpm format` uses Prettier's defaults (semicolons on). Note: **the working tree has an uncommitted reformat of `src/components/history/history-screen.tsx`** (semicolons removed, wrapped at 80 columns). Probably an editor setting. Plan 5 rewrites that file, so decide first: discard it (`git restore`) or adopt that style everywhere (a separate change).
- **Commits:** no Claude co-author or session lines. Squash iteration commits into one per plan before pushing.
- **Docs in the same change:** `apps/virs/README.md` and `apps/virs/DESIGN.md` name paths (`src/theme.ts`, `src/components/ui`, `src/components/layout`, `src/lib/session.ts`, `src/lib/analysis-store.tsx`, `src/lib/sources.ts`, `src/lib/translate-client.ts`, `src/lib/legacy-session.ts`). DESIGN.md says "If a rule here and the code disagree, fix one of them in the same change", so each plan lists the doc lines it changes.

## Decisions that need you (collected from all plans)

| Id | Decision | Recommendation | Plan |
| --- | --- | --- | --- |
| D1 | Where to send signed-out visitors | Keep the log-in pop-up: `/dashboard?login=1&next=<page>`. That flow already exists, and DESIGN.md says log-in is a pop-up. The alternative is a new `/sign-in` page. | 1 |
| D2 | DESIGN.md says "don't redirect signed-out visitors away from a feature that needs one; show an EmptyState". Your request reverses that for History. | Follow your request and rewrite that rule in DESIGN.md in the same change | 1 |
| D3 | Turn on Better Auth's `session.cookieCache` (5 min) | Yes. Every page now reads the session, and this stops each read from hitting the database. Cost: a revoked session can keep reading for up to 5 minutes; admin checks bypass the cache. | 1 |
| D4 | Reading the session in the root layout makes **every page dynamic** (no more static prerendering) | Accept it. The pages are cheap, and it's what "server-side at the layout" means. | 1 |
| D5 | Add `app/global-error.tsx` as well as `app/error.tsx` | Yes, a minimal one. `error.tsx` can't catch errors thrown by the root layout, and the root layout is about to read the session. | 2 |
| D6 | Under "one export per file", may a file also export its own **types** (props, return shape)? | Yes. One runtime export per file; types that describe that export may sit with it. Shared domain types get their own file. | 4 |
| D7 | Do private **constants** (`PAGE_SIZE`, lookup maps) stay in the component file? | Yes. Only functions, hooks and components move out. | 4 |
| D8 | Apply colocation and one-export-per-file to the **server code** too (`src/lib/api`, `src/lib/legacy`, `src/lib/csv.ts`, …, used only by `app/api/**`)? | Yes, as a separate last phase (3B/4B). It isn't UI and has no `useEffect`, so it can wait. | 3, 4 |
| D9 | Where the API contract types go (`SavedAnalysis`, `ProgressData`, `HistoryItem`). Client components import them from `route.ts` files today. | `@repo/core`, next to `Paginated` and `RatingEvent`. Otherwise `src/lib/api-types/`. | 4 |
| D10 | Also move one-off API calls that aren't effects (contact form, password recovery, iTranslate) to `useMutation`? | Optional. The plan converts only calls that must update cached queries. | 5 |
