# Ship the Mantine UI, screen by screen

**Type:** Frontend · **Size:** M for the first screen (reconciling the branch + solving auth), then S per screen after · **Priority:** Medium — nothing is broken; this is the visible modernization the PO is waiting on.

## The UI is already built — this card is not about writing it

`origin/mantine-ui` contains **18 pages and 22 components**, covering essentially every screen:

| Mantine page | Replaces (Angular) |
| --- | --- |
| `/` | home |
| `/sign-in` | `login` |
| `/sign-up` | `register` |
| `/forgot-password`, `/reset-password` | `recovery` |
| `/account` | `account` (+ `change-password`?) |
| `/words` | `search-words` |
| `/words/download` | `download-words` |
| `/analyze/text` | `text` |
| `/analyze/pdf` | `pdf` |
| `/analyze/document` | `doc` |
| `/analyze/image` | `image` |
| `/results` | `enhanced-text-result`, `text-statistics` |
| `/translate` | `itranslate` |
| `/contact` | `contact-us` |
| `/references` | `credits` |
| `/admin/words` | `admin` |

Production serves the prebuilt Angular app from `apps/virs/public` instead, via a rewrite in `next.config.ts`. Commit `cba0598` moved the Mantine pages off `main` onto the branch to make that possible.

## The good news: the rollout mechanism already exists

`apps/virs/next.config.ts:26` routes the Angular SPA with a **`fallback`** rewrite:

```ts
fallback: [{ source: "/:path((?!api/|_next/).*)", destination: "/index.html" }],
```

Fallback rewrites fire **only when nothing else matched**. So the moment a real Next.js page exists at a URL, that URL serves Mantine and every other URL keeps serving Angular — with no config change per screen. Screen-by-screen rollout is free architecturally. That is why this card is viable.

## What actually has to be solved

### 1. The branch is two commits stale and structurally diverged

`origin/mantine-ui` is missing both commits on `main`:

- `cba0598` — which added the Angular build **and every legacy API compatibility route**. Verified: the branch has **no** `/api/user/*`, `/api/analyzeText`, `/api/analyzeFile`, `/api/legacy/words`, or `/api/download/*`.
- `9ca4c88` — the error-handling fixes (`EnvConfigError`, the reset-email `try/catch`).

So this cannot be a plain merge. Rebase `mantine-ui` onto `main`, or cherry-pick pages and components forward one screen at a time. **Cherry-picking per screen is the better fit for this card** — it's the same granularity as the rollout.

### 2. The URLs don't line up — this is the real work per screen

Angular's own navigation links to: `/dashboard`, `/search-words`, `/download-words`, `/itranslate`, `/tests/*`. Mantine's pages live at `/words`, `/words/download`, `/translate`.

Because the rewrite is a *fallback*, a Mantine page at `/words` **does not** intercept Angular's `/search-words` — that URL still matches nothing and falls through to the Angular SPA. For each screen, pick one:

- **(a) Put the Mantine page at the Angular URL** (`/search-words/page.tsx`). Nothing else changes; Angular's existing links just start landing on the new UI. **Recommended** — lowest risk, no Angular rebuild.
- **(b) Keep the Mantine URL and add a redirect** from the Angular path. Cleaner final URLs, but Angular's in-app links still need editing, which means rebuilding the Angular bundle (`pnpm --filter virs build:legacy-ui`, requires Node 8 via nvm) and committing the output.

### 3. Auth has to work across both UIs — highest-risk unknown, settle it first

Mantine signs in with Better Auth directly (`components/auth/sign-in-form.tsx`: `authClient.signIn.username(...)`). Angular posts to the compatibility route `/api/user/login`.

**Before migrating any screen, verify that a user who logs in through the Angular UI is recognized as signed-in on a Mantine page, and vice versa.** If the session doesn't carry across, a user will appear logged out the moment they cross between UIs, and the rollout stalls. Migrating `/sign-in` first is tempting but it is the riskiest screen — prove the session bridge before touching auth.

### 4. Screens with no Mantine equivalent

- **`dashboard`** — Angular's post-login landing page, linked from the nav. No Mantine page exists. Needs building, or the nav needs repointing.
- **`change-password`** — may be covered by `/account`; confirm before dropping.
- **`not-found`** — Angular has a 404 screen; Mantine has none.
- **`tests/*`** — Angular's nav links to seven test routes (`beginner`, `intermediate`, `advanced`, `upper`, `depth`, `vocabA`, `vocabB`). These were deliberately not ported as unfinished and hidden. Decide whether the Mantine shell hides them or keeps linking into the Angular ones.

### 5. Two navigation shells will coexist

Angular has header/sidebar/footer; Mantine has `components/layout/site-shell.tsx`. While both are live, the Mantine shell must link out to Angular URLs for un-migrated screens, or users hit dead ends. Plan the nav as a single shared map of URL → label, applied in both shells.

## Suggested order

1. **Spike (no shipping):** rebase `mantine-ui` onto `main`, confirm it builds, and prove the auth session works across both UIs. This de-risks everything else.
2. **First real screen: `/references`** (Angular `credits`). Static, no auth, no data — proves the cutover mechanism end to end with nothing at stake.
3. **Then `/contact`**, then the four `/analyze/*` screens, then `/words` and `/words/download`.
4. **Auth screens and `/account` last**, once the session bridge is proven in production.
5. `/admin/words` whenever convenient — one admin account exists, so blast radius is tiny.

## Done when

- Each migrated URL serves Mantine; every other URL still serves Angular; no dead links in either shell
- A user can log in on either UI and stay logged in while crossing between them
- `pnpm turbo run check-types lint test build` passes on `main` after each screen

## Blocked on / needs from Annie

- A decision on option (a) vs (b) for URLs — (a) is recommended
- A decision on the `tests/*` nav links
- Node 8 via nvm, only if option (b) is chosen
