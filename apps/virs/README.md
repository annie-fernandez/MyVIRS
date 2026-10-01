# virs

Next.js rewrite of the Vocabulary in Reading Study backend. It replaces the Spring Boot API (`apps/api`) with REST route handlers under `src/app/api`, Neon Postgres through Drizzle (`@repo/db`), and the text analyzer ported to `@repo/core`. It serves the original Angular screens, so the hosted site looks exactly like the old app.

## Frontend

- **Original Angular UI (live).** `public/` holds the production build of `apps/web`. `next.config.ts` rewrites every non-API URL to `public/index.html`, so Angular's routes (`/dashboard`, `/search-words`, `/restore?token=…`) and deep-link reloads work. Vercel can't build Angular CLI 1.7 (it needs Node 8), so rebuild locally after changing `apps/web` and commit the output:
  ```sh
  pnpm --filter virs build:legacy-ui   # needs Node 8 via nvm
  ```
- **Compatibility layer.** The Angular screens still call the old endpoints (`/api/analyzeText`, `/api/words?…&sortDirection=`, `/api/user/*`, `/api/download/*`, …). Those routes, plus `src/lib/legacy/*`, return the old response shapes on top of the new services. The only Angular changes: login now checks the password on the server (`POST /api/user/login`), logout ends the server session, and the minimum password length is 8.
- **Mantine redesign (not released).** The new Mantine 9 UI lives on the `mantine-ui` branch and will replace these screens progressively.

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

### Microsoft Translator setup

Create an Azure Translator resource using the **F0 (Free)** pricing tier. In its
**Keys and Endpoint** panel, copy a key and the resource's location into the server
environment (locally, `apps/virs/.env.local`; on the hosted site, its deployment settings):

```dotenv
MICROSOFT_TRANSLATOR_KEY=your-resource-key
MICROSOFT_TRANSLATOR_REGION=your-resource-location
```

The region is required for regional and multi-service resources; leave it empty
for a global Translator resource. These variables must stay on the server and
must not use the `NEXT_PUBLIC_` prefix. Restart the server after configuring them.
Translation has no Google fallback and reports a configuration error if the key is missing.

The Angular translation and image-analysis screens call `/api/translate`. The
server uses Microsoft's v3 text API with source-language detection. Each request
accepts up to 5,000 characters. The translation screen prevents duplicate clicks
and displays provider-limit and quota errors. F0 provides 2 million characters per
month across the resource and stops translating when the allowance is exhausted;
choose F0 explicitly rather than a paid tier. See Microsoft's
[setup guide](https://learn.microsoft.com/en-us/azure/ai-services/translator/how-to/create-translator-resource)
and [free-plan FAQ](https://www.microsoft.com/en-us/translator/business/faq/).

Run translation integration tests with
`pnpm --filter virs exec vitest run src/app/api/translate/route.test.ts`.
These tests simulate provider responses; verify a live translation after adding
the Azure key. After changing Angular source, rebuild the served `public/` assets
as described above.

Errors always come back as `{ "error": { "code", "message", "details"? } }`. While the Angular UI is live, the legacy endpoints in the right-hand column also still work, returning the old response shapes (see Frontend).

| Method | Path | Auth | Replaces (legacy) |
| --- | --- | --- | --- |
| `POST` | `/api/analyze/text` `{ text }` | – | `POST /api/analyzeText` |
| `POST` | `/api/analyze/file` multipart `file`, `kind=pdf\|document\|image` | – | `POST /api/analyzeFile?type=` |
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
- **Files:** scanned PDFs are no longer OCR'd with Tesseract (upload the pages as images, which use AWS Textract). Images are capped at 10 MB, Textract's synchronous limit.
- **Paragraphs:** the enhanced text now breaks only at blank lines. Before, a double space also started a new paragraph.
- **Not ported:** the Oxford dictionary (its v1 API is shut down), the unfinished and hidden vocabulary tests, and the header language switcher (it translated only about 20 navigation labels, in English, Spanish and Farsi).
