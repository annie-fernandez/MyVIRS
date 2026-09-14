# virs

Next.js rewrite of the Vocabulary in Reading Study app. It replaces the Spring Boot API (`apps/api`) and the Angular frontend (`apps/web`) with one app: REST route handlers under `src/app/api`, Neon Postgres through Drizzle (`@repo/db`), and the text analyzer ported to `@repo/core`.

## Frontend

The UI is built only from [Mantine](https://mantine.dev) 9 components (`@mantine/core`, `form`, `charts`, `dropzone`, `modals`, `notifications`) with Tabler icons. There is no Tailwind and no custom design system; styling goes through Mantine props and theme tokens (`src/theme.ts`). The one CSS module styles the thousands of clickable words in the enhanced text. Pages call the app's own `/api` routes through TanStack Query (`src/lib/api-client.ts`); auth uses the Better Auth React client.

| Page | Path |
| --- | --- |
| Home | `/` |
| Analyze text / Word document / PDF / image | `/analyze/text`, `/analyze/document`, `/analyze/pdf`, `/analyze/image` |
| Results: enhanced text and statistics (kept in session storage) | `/results` |
| Search and download word lists | `/words`, `/words/download` |
| Translate, contact, references | `/translate`, `/contact`, `/references` |
| Sign in, sign up, forgot and reset password | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` |
| My account (signed in) | `/account` |
| Manage words (admin) | `/admin/words` |

`src/proxy.ts` sends signed-out visitors from `/account` and `/admin` to sign-in. The pages re-check the session and role on the server; non-admins get a 404. Old Angular URLs (`/search-words`, `/text-statistics`, `/itranslate`, …) permanently redirect to their new pages (`next.config.ts`).

Server Components can't pass `component={Link}` or compound components (`List.Item`) to Mantine. Use `ButtonLink`/`CardLink` from `src/components/link-components.tsx` and the flat exports (`ListItem`), or put the markup in a client component.

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

Errors always come back as `{ "error": { "code", "message", "details"? } }`.

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
