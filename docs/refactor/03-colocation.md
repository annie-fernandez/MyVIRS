# Plan 3: Vertical slices (colocation)

**Request:** Today there's one `components` folder and one `utils` (`lib`) folder, away from the routes that use them, so it's hard to find what belongs to a route. Use the standard colocation approach: each file as close as possible to its consumers, and as high up the tree as its importers need, for every page. Truly reusable files stay in the existing `components` folder.
**Depends on:** plans 2, 5 and 1 done, so that files about to be deleted (`SignedOut`, `useJson`, `useDraft`, `AnalysisProvider`) aren't moved first.
**Size:** M (mostly `git mv` plus import updates; no behavior changes)

---

## 1. The rules

What the Next docs say (`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`):
- Files inside `app/` are "safely colocated": a folder is only routable once it has a `page.tsx` or `route.ts`.
- **Private folders** `_name` opt a folder and everything under it out of routing. The docs recommend them for "separating UI logic from routing logic" and "avoiding potential naming conflicts with future Next.js file conventions". This matters here: a component file named `loading.tsx`, `error.tsx`, `layout.tsx`, `template.tsx` or `default.tsx` dropped into a route folder would *become* a special file.
- **Route groups** `(name)` organize routes without changing the URL, and let several routes share files and a layout.
- The "split project files by feature or route" strategy: code shared globally at the top, specific code inside the route segment that uses it.

The rules for this repo:

1. **A file lives in the closest folder that contains everything that imports it** (the lowest common ancestor). One importer → next to it. Several routes → their nearest shared route segment or group.
2. **Inside `app/`**, colocated code goes in private folders: `_components/` for `.tsx` (components and component hooks), `_lib/` for `.ts` (helpers, schemas, query options, types). Never loose next to `page.tsx`.
3. **`src/components/`** holds only UI used by two or more slices with no shared segment below `app/` (the design-system `ui/`, `shell-link`, `definition-modal`). **`src/lib/`** holds non-UI code used that widely (API client, auth, query keys, categories, sources), plus server modules shared by auth and the API (`env`, `email`).
4. A component's **CSS module sits next to it**. A CSS module used by components in different places gets split by class (section 4 lists the splits).
5. **Tests move with their module** (`vitest` includes `src/**/*.test.ts`, so any folder works).
6. **Imports:** `./` within a slice; `@/…` across slices or from `src/components` and `src/lib`. Route groups appear in import paths, e.g. `@/app/(analyze)/_lib/result-path`; TypeScript handles the parentheses.
7. **No route or URL changes.** `typedRoutes` is on, so `check-types` catches any slip. `MANTINE_PATHS` and `NAV_PARENT` don't change.
8. **Use `git mv`** so `git log --follow` keeps each file's history. Move first, then fix imports, in the same commit per slice.

## 2. Target tree

`←` marks where each file comes from. Files created by plans 1, 2 and 5 are marked with their plan. Plan 4 later splits several of these files; the folders stay as shown.

```
src/
  proxy.ts                                         (plan 1)
  theme.ts                                         (stays; plan 4 splits it into src/theme/)
  app/
    layout.tsx · providers.tsx · page.tsx          (stay)
    error.tsx · global-error.tsx                   (plan 2)
    _components/
      home-screen.tsx                              ← components/home/home-screen.tsx        [/ and /dashboard]
      site-shell/
        site-shell.tsx                             ← components/layout/site-shell.tsx       [root layout only]
        site-shell.module.css                      ← components/layout/site-shell.module.css
        nav.ts                                     ← components/layout/nav.ts (without MANTINE_PATHS)
        account-menu/
          account-menu.tsx                         ← components/layout/account-menu.tsx
          register-form.tsx                        ← components/account/register-form.tsx  [only account-menu]
          sign-up-schema.ts                        ← lib/account-schemas.ts (signUpSchema, SignUpValues)
    dashboard/page.tsx                             (stays)
    (analyze)/                                     NEW group: the sidebar's single "Analyze" entry
      _lib/
        result-path.ts                             ← RESULT_PATH (analyze-screen.tsx:25) = VIEW_PATH (results-screen.tsx:37), deduplicated
      _components/
        analyze-screen/
          analyze-screen.tsx                       ← components/analysis/analyze-screen.tsx
          analyze-screen.module.css                ← analysis.module.css: .tab .fileRow .dropzone
        results-screen/
          results-screen.tsx                       ← components/analysis/results-screen.tsx
          results-screen.module.css                ← analysis.module.css: .key .reading .paragraph
      text/page.tsx · doc/page.tsx · pdf/page.tsx · image/page.tsx                       ← app/<same>/page.tsx
      enhanced-text-result/page.tsx · text-statistics/page.tsx                            ← app/<same>/page.tsx
    (signed-in)/                                   (plan 1)
      layout.tsx                                   (plan 1)
      _components/
        password-form.tsx                          ← components/account/password-form.tsx   [account + change-password]
      _lib/
        change-password-schema.ts                  ← lib/account-schemas.ts (changePasswordSchema, ChangePasswordValues)
      history/
        page.tsx                                   (plan 1 moved it here)
        _components/
          history-screen.tsx                       ← components/history/history-screen.tsx
          progress-panel.tsx                       ← components/history/progress-panel.tsx
          words-panel.tsx                          ← components/history/words-panel.tsx
          word-in-context.tsx                      ← components/analysis/word-in-context.tsx [only words-panel]
          history.module.css                       ← components/history/history.module.css (plan 4 splits it by component)
        _lib/
          progress-query.ts · history-page-query.ts · saved-analysis-query.ts   (plan 5)
      account/
        page.tsx
        _components/account-screen.tsx             ← components/account/account-screen.tsx
      change-password/
        page.tsx
        _components/change-password-screen.tsx     ← components/account/change-password-screen.tsx
      admin/
        layout.tsx                                 (plan 1)
        page.tsx
        _components/admin-screen.tsx               ← components/admin/admin-screen.tsx
        _lib/admin-word-query.ts · invalidate-word-lists.ts   (plan 5)
    search-words/
      page.tsx
      _components/search-screen.tsx                ← components/words/search-screen.tsx
      _lib/words-query.ts · word-lookup-query.ts   (plan 5)
    download-words/
      page.tsx
      _components/download-screen.tsx              ← components/words/download-screen.tsx
    itranslate/
      page.tsx
      _components/translate-screen.tsx             ← components/tools/translate-screen.tsx
      _lib/translate-in-browser.ts                 ← lib/translate-client.ts   (renamed after its export)
      _lib/translation-languages.ts                ← lib/translation-languages.ts
    contact-us/
      page.tsx
      _components/contact-screen.tsx               ← components/info/contact-screen.tsx
    credits/
      page.tsx
      _components/references-screen.tsx            ← components/info/references-screen.tsx
    restore/
      page.tsx
      _components/restore-screen.tsx               ← components/account/restore-screen.tsx
      _lib/new-password-schema.ts                  ← lib/account-schemas.ts (newPasswordSchema, NewPasswordValues)
    register/page.tsx                              (stays; redirect only)
    style-guide/
      page.tsx
      _components/style-guide.tsx                  ← app/style-guide/style-guide.tsx (into _components, for consistency)
    api/…                                          (phase 3B, section 5)
  components/                                      SHARED UI ONLY
    ui/                                            (stays; plan 4 splits index.tsx into one file per component)
    shell-link/
      shell-link.tsx                               ← components/layout/shell-link.tsx  [ui, home, results, definition-modal, restore, history, site-shell, error]
      mantine-paths.ts                             ← MANTINE_PATHS from components/layout/nav.ts (only shell-link uses it)
    definition-modal/
      definition-modal.tsx                         ← components/analysis/definition-modal.tsx [search-words, (analyze) results, (signed-in) history]
      dictionary-query.ts · word-ratings-query.ts  (plan 5)
  lib/                                             SHARED NON-UI
    api-client.ts · get-query-client.ts · query-keys.ts       (query ones from plan 5)
    analysis-store.ts                              ← lib/analysis-store.tsx (plan 5 rewrote it; no JSX left, so .ts) [(analyze) + history]
    sources.ts · categories.ts                     (stay; used across slices and by components/ui)
    account-schemas/                               ← lib/account-schemas.ts, the shared parts only:
      password-schema.ts                             passwordSchema (private today; used by sign-up, new password, change password)
      refine-passwords-match.ts                      replaces the private `matching` + `mismatch` pair with one export,
                                                     `refinePasswordsMatch(schema)` = `schema.refine(matching, mismatch)` (new + change password)
      profile-schema.ts                              profileSchema + ProfileValues (account-screen; sign-up extends it)
      username-schema.ts                             usernameSchema (used by profileSchema)
      user-level-select-data.ts                      USER_LEVEL_SELECT_DATA (register-form + account-screen)
    auth/                                          everything auth, in one folder:
      auth.ts                                      ← lib/auth.ts
      auth-client.ts                               ← lib/auth-client.ts
      session.ts                                   ← lib/session.ts (plan 1: getServerSession only)
      session-user.ts · to-session-user.ts · session-provider.tsx   (plan 1)
      legacy-session.ts · legacy-session.test.ts   ← lib/legacy-session.ts(+test)
    env.ts · email.ts · email.test.ts              (stay: used by lib/auth and the API)
```

`profile-schema.ts` sits in `src/lib` and not in `(signed-in)/account` because `signUpSchema` (site shell) extends it: their nearest common folder is `app/`, and it's non-UI shared code, so `src/lib`.

Folders that end up empty and get deleted: `components/account`, `components/admin`, `components/analysis`, `components/history`, `components/home`, `components/info`, `components/layout`, `components/tools`, `components/words`.

## 3. Order of work (one commit per slice)

Run `pnpm --filter virs check-types` after each slice.

1. **Shared first** (everything else imports these):
   - `components/layout/shell-link.tsx` → `components/shell-link/shell-link.tsx`. Move `MANTINE_PATHS` from `nav.ts` into `components/shell-link/mantine-paths.ts`. Update importers: `grep -rln "components/layout/shell-link" src`.
   - `lib/auth*.ts`, `session*.ts(x)`, `legacy-session*` → `lib/auth/`. Fix relative imports inside (`./auth` stays `./auth`; `./email` → `../email`; `./env` → `../env`). `src/app/api/**` imports `@/lib/auth` and `@/lib/session`: update them to `@/lib/auth/auth`.
   - `lib/account-schemas.ts` → split as in the tree. Its consumers move in later slices, so point imports at the new files now.
2. **Definition pop-up** → `components/definition-modal/` (it imports `ShellLink`, ui, `api-client`, `categories`, theme).
3. **Site shell** → `app/_components/site-shell/` (+ `account-menu/register-form.tsx`, `sign-up-schema.ts`). Update `app/layout.tsx`'s import.
4. **Home** → `app/_components/home-screen.tsx`. Update `app/page.tsx` and `app/dashboard/page.tsx`.
5. **(analyze) group:** `git mv` the six route folders into `app/(analyze)/`; move the two screens; split `analysis.module.css`; add `_lib/result-path.ts` (with the `View` type) and import it from both screens, deleting the two local copies. Make sure the six URLs still work.
6. **(signed-in) slices:** history (with `word-in-context`), account, change-password, admin, and the shared `password-form` + `change-password-schema`.
7. **Single-route slices:** search-words, download-words, itranslate (`lib/translate-client.ts` → `_lib/translate-in-browser.ts`, `lib/translation-languages.ts` → `_lib/`), contact-us, credits, restore (+ `new-password-schema.ts`), style-guide.
8. **Clean-up:** delete the empty `components/*` folders; `grep -rn "@/components/\(layout\|account\|admin\|analysis\|history\|home\|info\|tools\|words\)" src` → nothing.
9. **Docs** (same PR):
   - `apps/virs/DESIGN.md` top list: "The site frame … `src/components/layout`" → `src/app/_components/site-shell`; "The four ways to add text: `src/lib/sources.ts`" stays. Add a short **"Where files go"** section with the rules from section 1, so later screens follow them.
   - `apps/virs/README.md`: "Shell: `src/components/layout` holds…" → `src/app/_components/site-shell`; `nav.ts` and `MANTINE_PATHS` → `components/shell-link/mantine-paths.ts`; `src/lib/session.ts` → `src/lib/auth/session.ts`; `src/lib/translate-client.ts` → `src/app/itranslate/_lib/translate-in-browser.ts`; `src/lib/legacy-session.ts` → `src/lib/auth/legacy-session.ts`.
   - `src/components/ui/index.tsx` header comment: "Add a component here only when a second screen needs it." Still true; keep it.

## 4. CSS module splits

| Today | Classes → new file |
| --- | --- |
| `components/analysis/analysis.module.css` | `.tab .fileRow .dropzone` → `(analyze)/_components/analyze-screen/analyze-screen.module.css`; `.key .reading .paragraph` → `…/results-screen/results-screen.module.css` |
| `components/history/history.module.css` | Moves whole into `(signed-in)/history/_components/`. Plan 4 splits it per component (`.tab` → history-screen, `.statTile` → stat-tile, `.learnTrack .learnBar .keySwatch` → improvement-story / key-item). |
| `components/ui/ui.module.css` | Stays in `components/ui/`. Plan 4 splits it per component. |
| `components/layout/site-shell.module.css` | Moves whole with the site shell |

Copy any shared rules a class depends on (variables, `:global` selectors, media queries) into each new file; read the CSS file in full before splitting it.

## 5. Phase 3B (D8): server code used only by `app/api`

Same rule, for code only API routes import. It isn't UI and changes no behavior, so you can do it later or skip it. Importers verified with grep:

| Today | Imported by | Target |
| --- | --- | --- |
| `lib/api/http.ts`, `lib/api/guards.ts` | every `app/api/**/route.ts` | `app/api/_lib/http.ts`, `app/api/_lib/guards.ts` |
| `lib/legacy/format.ts` | `api/words/[value]/[categories]`, `api/analyzeFile`, `api/analyzeText`, `api/admin/words`, `api/admin/words/[id]`, `api/legacy/words`, `api/download/[categories]`, `api/user/*` (6) | `app/api/_lib/legacy-format.ts` |
| `lib/legacy/auth.ts` | `api/user/*` only (6 routes) | `app/api/user/_lib/legacy-auth.ts` |
| `lib/analysis/analyze.ts`, `extract.ts`, `history.ts` | `api/analyze/text`, `api/analyze/file`, `api/analyzeText`, `api/analyzeFile` | `app/api/_lib/analysis/` (LCA is `app/api`, because the legacy routes `analyzeText`/`analyzeFile` share them) |
| `lib/csv.ts` (+test) | `api/words/export`, `api/admin/words/export`, `api/admin/words/import` | `app/api/_lib/csv.ts` (+test) |
| `lib/dictionary.ts` (+test) | `api/entries/[word]`, `api/dictionary/[word]` | `app/api/_lib/dictionary.ts` (+test) |
| `lib/db-errors.ts` | `api/admin/words`, `api/admin/words/[id]` | `app/api/admin/words/_lib/db-errors.ts` |
| `lib/translate.ts` | `api/translate` only | `app/api/translate/_lib/translate.ts` |
| `lib/env.ts`, `lib/email.ts` | `lib/auth` and the API | **stay** in `src/lib` (auth is outside `app/api`) |

`app/api/_lib/` is private, so nothing in it becomes an endpoint. **Don't** put helpers loose next to a `route.ts`.

## 6. Manual checks

- [ ] Every URL still opens: `/`, `/dashboard`, `/text`, `/doc`, `/pdf`, `/image`, `/enhanced-text-result`, `/text-statistics`, `/history`, `/account`, `/change-password`, `/admin`, `/search-words`, `/download-words`, `/itranslate`, `/contact-us`, `/credits`, `/restore`, `/register` (→ redirect), `/style-guide`.
- [ ] The sidebar highlights Analyze on all six (analyze) pages (`NAV_PARENT` is keyed by URL, so it should).
- [ ] An Angular URL (`/tests/...`) still loads the Angular app.
- [ ] `pnpm --filter virs build` route list matches the list before the move. Compare it with the build output from `main`.
- [ ] `git log --follow src/app/(signed-in)/history/_components/history-screen.tsx` shows the old history.
- [ ] `find src/components -mindepth 1 -maxdepth 1` → only `ui`, `shell-link`, `definition-modal`.

## 7. Noticed, not changed

- `app/page.tsx` has stray blank lines in `HomePage` (lines 4-5). Leave them unless you ask.
- `/` and `/dashboard` render the same screen. Merging them (a redirect) would be a product decision.
