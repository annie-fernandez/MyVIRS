# virs

Next.js rewrite of the Vocabulary in Reading Study backend. It replaces the Spring Boot API (`apps/api`) with REST route handlers under `src/app/api`, Neon Postgres through Drizzle (`@repo/db`), and the text analyzer ported to `@repo/core`. It serves the original Angular screens, so the hosted site looks exactly like the old app.

## Frontend

- **Original Angular UI (fallback).** `public/` holds the production build of `apps/web`. `next.config.ts` rewrites every URL that has no Next.js page to `public/index.html`, so the Angular routes that haven't moved to Mantine (now only `/tests/*`) and their deep-link reloads still work. Vercel can't build Angular CLI 1.7 (it needs Node 8), so rebuild locally after changing `apps/web` and commit the output:
  ```sh
  pnpm --filter virs build:legacy-ui   # needs Node 8 via nvm
  ```
- **Compatibility layer.** The Angular screens still call the old endpoints (`/api/analyzeText`, `/api/words?…&sortDirection=`, `/api/user/*`, `/api/download/*`, …). Those routes, plus `src/app/api/_lib/legacy/*`, return the old response shapes on top of the new services. The only Angular changes: login now checks the password on the server (`POST /api/user/login`), logout ends the server session, and the minimum password length is 8.
- **Mantine screens.** Every screen is a Next.js page under `src/app`, at the same URL the Angular screen used (`/dashboard`, `/text`, `/doc`, `/pdf`, `/image`, `/enhanced-text-result`, `/text-statistics`, `/search-words`, `/download-words`, `/itranslate`, `/contact-us`, `/credits`, `/register`, `/account`, `/change-password`, `/restore`, `/admin`), plus `/sign-in`. Each route keeps its own components and code beside it (see "Where files go" in `DESIGN.md`). Only the hidden vocabulary tests (`/tests/*`) still fall through to Angular.
  - **Design rules:** `DESIGN.md` covers colors, type, layout, which component to use for what, and writing. Values live in `src/theme/`, shared components in `src/components/ui`, and `/style-guide` (not linked anywhere) renders all of it.
  - **Shell:** `src/app/_components/site-shell` holds the indigo side menu (site name; Analyze, Word lists, Tools; the citation button and the account menu at the bottom, collapsible to icons), the bar that opens it on phones, and the footer, with their links beside them (`nav-sections.ts`, `footer-links.ts`, …). `src/components/shell-link/mantine-paths.ts` lists the URLs that are Mantine pages, so links to them navigate client-side.
  - **Sessions:** the root layout reads the session once on the server (`src/lib/auth/get-server-session.ts`, cached per request, with Better Auth's 5-minute cookie cache) and hands the user to every component through `SessionProvider` (`useSession()`). Components never fetch the session themselves.
  - **Pages that need an account** (`/history`, `/account`, `/change-password`, `/admin`) live in `src/app/(signed-in)`. `src/proxy.ts` redirects visitors without a session cookie to `/sign-in?title=…&next=<page>`, and the group's layout does the same for an expired session; the sign-in page says what needs an account and opens the account pop-up (Log in or Create an account); once they're in, it sends them back to `next` (only paths on this site are accepted). Old `/register` links open it with the sign-up pop-up already showing. `/admin` answers 404 to non-admins. The API routes check the session again (`src/app/api/_lib/auth`).
  - **Results** (`/enhanced-text-result`, `/text-statistics`) read the latest analysis from `sessionStorage` (`src/lib/analysis-store/`), so they survive a reload in the same tab.
  - **Photos** are read in the browser with tesseract.js; only the extracted text is sent to `/api/analyze/text`.
  - **Analysis by context** (`/context-analysis`, a preview) shows Team A's ranked word lists (github.com/AlePerez09/capstone2myvirs): which words in a textbook to teach first, by context or by frequency. Their Python pipeline runs on their side and writes a "contract v1" JSON file; the file goes unchanged into `src/app/api/context-lists/_lib/files/` with an entry in `context-lists.ts`, and `@repo/core` (`context-ranking.ts`) checks it against their contract when it's read. VIRS only re-sorts it for By frequency, following their rule.
  - **Translation** calls Google from the browser (`src/app/itranslate/_lib/translate-in-browser.ts`). Google answers browsers but rejects requests from servers with HTTP 429, so `/api/translate` fails on Vercel; it is kept only for the Angular screen.
  - **Sign-in across both UIs:** both use the same Better Auth session cookie. Angular decides what to show from `localStorage` (`currentUser`, `userName`, `level`, `email`), so `SessionProvider` rewrites those keys to match the real session on every page load and window focus (`src/lib/auth/sync-legacy-session.ts`).

## Setup

```sh
pnpm install
cp apps/virs/.env.example apps/virs/.env.local     # fill in DATABASE_URL and BETTER_AUTH_SECRET
cp packages/db/.env.example packages/db/.env       # same Neon database, plus the direct URL

pnpm --filter @repo/db db:migrate                  # create tables
pnpm --filter @repo/db db:seed                     # load the bundled word lists (K1, K2, AWL, BAW)
pnpm turbo run dev --filter=virs
```

Load the full production data from the legacy database (words and user accounts):

```sh
LEGACY_DATABASE_URL=mysql://… pnpm --filter @repo/db db:import-legacy
```

Legacy passwords were AES-encrypted in the browser with a hardcoded key. The import decrypts them once and stores scrypt hashes, so existing users keep their passwords.

Grant admin access to a registered account:

```sh
pnpm --filter @repo/db db:make-admin <username>
```

After changing `packages/db/src/schema`, run `pnpm --filter @repo/db db:generate` and commit the migration.

## API

Errors always come back as `{ "error": { "code", "message", "details"? } }`. While the Angular UI is live, the legacy endpoints in the right-hand column also still work, returning the old response shapes (see Frontend).

| Method | Path | Auth | Replaces (legacy) |
| --- | --- | --- | --- |
| `POST` | `/api/analyze/text` `{ text }` | – | `POST /api/analyzeText` |
| `POST` | `/api/analyze/file` multipart `file`, `kind=pdf\|document` | – | `POST /api/analyzeFile?type=` |
| `GET` | `/api/dictionary/:word` | – | `GET /api/entries/:word?source=WIKI` |
| `GET` | `/api/words?category&grade&q&page&pageSize&sort` | – | `GET /api/words`, `/api/words/valueandcat` |
| `GET` | `/api/words/:value` | – | `GET /api/words/:value/:categories` |
| `GET` | `/api/words/export?categories=k1,awl` | – | `GET /api/download/:categories` |
| `POST` | `/api/translate` `{ text, target }` | – | browser call to Google |
| `POST` | `/api/contact` | – | formcarry.com form |
| `POST` | `/api/account/forgot-password` `{ identifier }` | – | `GET /api/user/recovery/:user`, `/recovery_email/:email` |
| `*` | `/api/auth/*` (Better Auth) | – | `/api/user/*` |
| `GET` | `/api/admin/words?value=` | admin | `GET /api/admin/words/:value` |
| `POST` | `/api/admin/words` `{ value, category, grade? }` | admin | `POST/PUT /api/admin/words` |
| `PATCH` / `DELETE` | `/api/admin/words/:id` | admin | `DELETE /api/admin/words/:value` |
| `DELETE` | `/api/admin/words?category=` | admin | `GET /api/admin/words/delete/:category` |
| `POST` | `/api/admin/words/import` multipart `file`, `category?`, `replace?` | admin | `POST /api/admin/resources` |
| `GET` | `/api/admin/words/export` | admin | `GET /api/admin/resources` |

Useful Better Auth endpoints: `POST /api/auth/sign-up/email` `{ email, password, name, username, userLevel? }`, `POST /api/auth/sign-in/username`, `POST /api/auth/sign-out`, `GET /api/auth/get-session`, `POST /api/auth/update-user`, `POST /api/auth/change-password`, `POST /api/auth/reset-password`, `POST /api/auth/delete-user`.

## Behavior changes from the legacy app

- **Security:** passwords are hashed server-side and sessions are real. Legacy login downloaded the user record and compared passwords in the browser. Admin is a role on the account, not a shared basic-auth user. Dictionary HTML is sanitized. Password recovery no longer reveals whether an account exists.
- **Analysis:** tokens are stripped of punctuation before singularizing, and the word as written is tried before its singular. Hyphenated list entries ("co-worker") now match. Basic Academic Words count in the statistics; before, they silently dropped out of the totals.
- **Categories** are lowercase enums (`k1`, `awl`, …). Grades are `K`, `G1`…`G12`.
- **Files:** scanned PDFs are no longer OCR'd on the server (upload the pages as images). Images are read in the browser with tesseract.js, and the extracted text is posted to `POST /api/analyze/text`. The server does not call AWS.
- **Paragraphs:** the enhanced text now breaks only at blank lines. Before, a double space also started a new paragraph.
- **Not ported:** the Oxford dictionary (its v1 API is shut down), the unfinished and hidden vocabulary tests, and the header language switcher (it translated only about 20 navigation labels, in English, Spanish and Farsi).
