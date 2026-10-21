# Plan 4: One export and one component per file

**Request:** One export and one component per file. Helper functions get reused: very general ones go global; ones tied to a component get their own file next to that page or component.
**Depends on:** plans 2, 5, 1 and 3. Paths below are the **targets from plan 3**. Contents are the files as they'll be after plans 1 and 5, which delete several of the pieces that exist today.
**Size:** L (many small files; mechanical)

---

## 1. The rule, precisely

1. **Each `.ts` / `.tsx` module has exactly one exported value**: a component, hook, function, class or constant.
2. **At most one React component is defined per file**, and it's the export. Sub-components (`StatTile`, `SortHeader`, `LoginModal`, …) each get their own file next to their only consumer.
3. **Helper functions and hooks are never private to a file.** Each gets its own file next to its consumer (or higher, if several files use it, by plan 3's rule). That includes one-liners like `formatDate`, `percent` and `countWords`, as you asked.
4. **D6 – types:** a file may also export the types that describe its own export (props, a hook's return type, a function's input). Domain types used by several files (`HistoryItem`, `RatingFilter`, `DefinitionTarget`, `Notice`) get their own file. *Recommended; otherwise every `Props` interface becomes a file.*
5. **D7 – private constants:** non-function constants used only in that file (`PAGE_SIZE`, `DESCRIPTION`, `LEVEL_COLORS`, `GRID`) stay in it, unexported. *Recommended; moving `const PAGE_SIZE = 10` into its own file adds nothing.*
6. **File name = the export in kebab-case:** `formatDateTime` → `format-date-time.ts`, `useConfirm` → `use-confirm.tsx`, `StatTile` → `stat-tile.tsx`. `.tsx` only if the file contains JSX.
7. **No barrels.** `components/ui/index.tsx` re-exports ten components (ten exports), so it goes away. Imports become `@/components/ui/surface`, `@/components/ui/page-header`, …
8. **Named exports**, as now, except where Next requires a default.
9. **Exempt:** Next special files (`page.tsx`: default + `metadata`/`generateMetadata`; `layout.tsx`: default + `metadata`; `route.ts`: one export per HTTP method; `proxy.ts`: `proxy` + `config`; `error.tsx`, `global-error.tsx`), `*.test.ts`, `*.module.css`, and `packages/*` (out of scope).
10. **"General vs tied" helpers:** a helper used by one slice lives in that slice's `_lib/`. One used across slices goes in `src/lib/`. Only promote it when a second slice actually imports it; don't guess at future reuse.

**Checking it** (there's no built-in ESLint rule that counts exports):

```sh
# Files with more than one runtime export (ignores `export type` / `export interface`), skipping exempt files.
cd apps/virs && grep -rcE '^export (default |async )?(function|const|class|let)' src \
  --include='*.ts' --include='*.tsx' | grep -vE ':(0|1)$' \
  | grep -vE '/(page|layout|route|proxy|error|global-error)\.tsx?:|\.test\.ts:'
```

It should print nothing when you're done. Two cases it misses: a file with one export and an extra private component or helper (rule 2/3), and re-exports. For those, run `grep -nE '^(function|const [a-zA-Z]+ = \()' <file>`, or review the diff. To enforce this in CI later, a 20-line Node script under `apps/virs/scripts/` could run this check with an exempt list. Optional.

---

## 2. Splits: shared code

### `src/components/ui/index.tsx` → one file per component (and drop the barrel)

| New file | Export | Also moves |
| --- | --- | --- |
| `marker.tsx` | `Marker` | |
| `page-header.tsx` | `PageHeader` | `PageHeaderProps` |
| `section.tsx` | `Section` | |
| `option-card.tsx` | `OptionCard` | `OptionCardProps` |
| `surface.tsx` | `Surface` | |
| `word-tag.tsx` | `WordTag` | `WordTagProps` |
| `category-legend.tsx` | `CategoryLegend` | `CategoryLegendProps` |
| `rating-buttons.tsx` | `RatingButtons` | `RatingButtonsProps` |
| `empty-state.tsx` | `EmptyState` | `EmptyStateProps` |
| `pager.tsx` | `Pager` | |

- Put the file-header comment (when to add a shared component; DESIGN.md; `/style-guide`) in a short `components/ui/README.md`, or on `surface.tsx`. Each file keeps its own doc comment.
- `ui.module.css` → one module per component (`marker.module.css`, `option-card.module.css`, …), by class: `.marker` → marker; `.eyebrow .lead` → page-header; `.optionCard .optionArrow .optionIcon` → option-card; `.surface` → surface; `.wordTag` → word-tag; `.legendItem .legendSwatch` → category-legend; `.rating .ratingStep` → rating-buttons; `.emptyState` → empty-state; `.pagerArrow` → pager. (`optionIcon` is referenced in TSX but not found as a top-level selector; find where it's defined before splitting.)
- Update every importer (`grep -rln '@/components/ui"' src`; about 18 files) and `app/style-guide/_components/style-guide.tsx`.
- DESIGN.md "Shared components: `src/components/ui` (`PageHeader`, …)" stays true; add "one file per component".

### `src/theme.ts` → `src/theme/`

| New file | Export | Notes |
| --- | --- | --- |
| `virs-colors.ts` | `VIRS_COLORS` (+ `VirsColor` type) | |
| `virs-tokens.ts` | `VIRS_TOKENS` | |
| `category-styles.ts` | `CATEGORY_STYLES` (+ `CategoryKey` type) | |
| `rating-scale.ts` | `RATING_SCALE` | Drop the `export type { RatingValue } from "@repo/core"` re-export (line 83); importers take `RatingValue` from `@repo/core` directly |
| `text-on.ts` | `textOn` | private `LUMINANCE_THRESHOLD` moves with it |
| `tint-vars.ts` | `tintVars` | |
| `theme.ts` | `theme` (`createTheme`) | private `EUROPA`, `LEXEND` move with it |
| `css-variables-resolver.ts` | `cssVariablesResolver` | |

Importers: `grep -rln '@/theme"' src` (providers, style-guide, definition-modal, results-screen, words-panel, translate-screen, download-screen, ui, categories, sources). Update DESIGN.md's "Values … `src/theme.ts`" and "Change colors … in `theme.ts`" to `src/theme/`, and the comments in `app/layout.tsx` and `theme.ts` that mention it.

### `src/lib`

| Today | Split into |
| --- | --- |
| `api-client.ts` (`ApiClientError`, `apiFetch`, `errorMessage`, private `FALLBACK_MESSAGE`, `RequestOptions`) | `lib/api-client/api-client-error.ts`, `api-fetch.ts` (+ `RequestOptions` type), `error-message.ts`, `fallback-message.ts` (`FALLBACK_MESSAGE`, now exported, since two files use it) |
| `categories.ts` (5 exports) | `lib/categories/category-keys.ts`, `category-label.ts`, `category-description.ts`, `category-select-data.ts`, `grade-select-data.ts` |
| `sources.ts` | already one export (`TEXT_SOURCES` + `TextSource` type). No change. |
| `query-keys.ts`, `get-query-client.ts` | one export each (plan 5). `getQueryClient` has a private `makeQueryClient` function → `make-query-client.ts` (rule 3). |
| `analysis-store.ts` (plan 5: `setAnalysis`, `useAnalysis`, private `read`/`subscribe`, `StoredAnalysis` type) | `lib/analysis-store/stored-analysis.ts` (type), `analysis-store.ts` (one exported object `analysisStore = { read, subscribe, set }` holding the module state), `set-analysis.ts`, `use-analysis.ts` |
| `auth/auth.ts` (`getAuth`, `Auth` type, private `createAuth`, `assertValidUserLevel`, `USERNAME_PATTERN`) | `auth/get-auth.ts` (+ `Auth` type), `auth/create-auth.ts`, `auth/assert-valid-user-level.ts` |
| `auth/auth-client.ts` | one export + `Session` type (delete the type if plan 1 left it unused). No change. |
| `auth/session.ts` | after plan 1 it only exports `getServerSession` → rename the file `get-server-session.ts` |
| `auth/session-provider.tsx` (plan 1: context, provider, 4 hooks) | `session-context.ts`, `session-provider.tsx`, `use-session.ts`, `use-required-user.ts`, `use-session-changed.ts`, `use-sign-out.ts`. The provider's `queryFn` → `refresh-session.ts` |
| `auth/legacy-session.ts` | one export. Rename it `sync-legacy-session.ts` (+ test) to follow rule 6. |
| `account-schemas/*` | already one per file from plan 3. Each schema file also exports its `…Values` type (D6). |
| `env.ts` (`env`, `EnvConfigError`, `ServerEnv` type) | `env.ts` (+ `ServerEnv`), `env-config-error.ts` |
| `email.ts` (`sendEmail`, `formatErrorReport`, `reportServerError`, `escapeHtml`, `EmailMessage` type) | `send-email.ts` (+ `EmailMessage`), `format-error-report.ts`, `report-server-error.ts`, `escape-html.ts`. Split `email.test.ts` the same way (by `describe` block). |

### `src/components/shell-link/` and `src/components/definition-modal/`

| File | Split into |
| --- | --- |
| `shell-link.tsx` | already one component. No change. |
| `definition-modal.tsx` | `definition-modal.tsx` (`DefinitionModal`), `definition-target.ts` (`DefinitionTarget` type: search, results, words-panel import it), `word-rating.tsx` (`WordRating`), `rating-label.ts`, `format-day.ts`. The query files from plan 5 are already one each. |

---

## 3. Splits: route slices (paths as in plan 3)

### `app/_components/site-shell/`

| File | Split into |
| --- | --- |
| `site-shell.tsx` (`SiteShell`, `FooterContent`) | `site-shell.tsx`, `footer-content.tsx`. `NAV_PARENT` and the height/width constants stay (D7). |
| `nav.ts` (6 exports, 2 interfaces; `MANTINE_PATHS` already moved by plan 3) | `nav-sections.ts` (+ `NavItem`, `NavSection` types), `account-links.ts`, `footer-links.ts`, `social-links.ts`, `citation.ts` |
| `account-menu/account-menu.tsx` (`AccountMenu`, `LoginModal`, `RecoveryModal`, initials logic) | `account-menu.tsx`, `login-modal.tsx`, `recovery-modal.tsx`, `get-initials.ts` (the `.split(" ")…join("")` at lines 73-78), `close-requested.ts` or `use-close-requested.ts` (plan 5's URL helper) |
| `account-menu/register-form.tsx` | one component. No change. |

### `app/_components/home-screen.tsx`
One component; `FILE_SOURCES` stays (D7). No change.

### `app/(analyze)/`

| File | Split into |
| --- | --- |
| `_lib/result-path.ts` (plan 3) | `result-path.ts` (`RESULT_PATH`), `result-view.ts` (`ResultView` type = `"enhanced" \| "statistics"`) |
| `analyze-screen/analyze-screen.tsx` (`AnalyzeScreen`, `SourceKey` type, `formatBytes`, `countWords`, `readPhoto`; `useDraft` was removed by plan 5) | `analyze-screen.tsx` (+ `SourceKey` as its props type), `format-bytes.ts`, `count-words.ts`, `read-photo.ts`, plus plan 5's `use-analyze-mutation.ts` if the mutation was written as a hook. `DESCRIPTION`, `FILE_KIND`, `MIN_WORDS_FOR_SCORE`, `INPUT_AREA_HEIGHT`, `DRAFT_KEY` stay (D7). |
| `results-screen/results-screen.tsx` (`ResultsScreen`, `HistoryNote`, `EnhancedText`, `Statistics`, `percent`, `categoryOf`, `toParagraphs`) | `results-screen.tsx`, `history-note.tsx`, `enhanced-text.tsx`, `statistics.tsx`, `percent.ts`, `category-of.ts`, `to-paragraphs.ts`. Optional: the `wordsByCategory` `useMemo` body → `words-by-category.ts` (a pure function, so it's testable). `LEVEL_COLORS` and `LEVEL_EXPLANATIONS` go with `statistics.tsx`; `PAGE_SIZE` with `enhanced-text.tsx`. Split `results-screen.module.css` the same way: `.key .reading .paragraph` are all used by `EnhancedText` → `enhanced-text.module.css`. |

### `app/(signed-in)/`

| File | Split into |
| --- | --- |
| `_components/password-form.tsx` | one component. No change. |
| `history/_components/history-screen.tsx` (after plans 1 and 5: `HistoryScreen`, the tabs body, `ProgressGate`, `HistoryList`, `HistoryItem`, `readability`, `formatDate`) | `history-screen.tsx` (page header + tabs), `progress-gate.tsx`, `history-list.tsx`, `history-item.ts` (type; or from D9), `readability.ts`, `format-date-time.ts`. `SOURCE` (map by kind; only `HistoryList` uses it), `TAB_WIDTH` and `PAGE_SIZE` stay as private constants (D7). If the rate mutation or the delete/open mutations became custom hooks: `use-rate-word.ts`, `use-delete-analysis.ts`, `use-open-analysis.ts`. |
| `history/_components/progress-panel.tsx` (`ProgressPanel`, `ImprovementStory`, `KeyItem`, `StatTile`, `ChartCard`, `shortDate`, `fromDayKey`, `ProgressLink` type) | `progress-panel.tsx` (+ `ProgressLink`, its `onOpen` prop type), `improvement-story.tsx`, `key-item.tsx`, `stat-tile.tsx`, `chart-card.tsx`, `from-day-key.ts`; `short-date.ts` is **shared with words-panel** (it has its own `shortDate`, line 13; merge them into one taking `string \| Date`). `GRID`, `DOT`, `JUMPS` stay. |
| `history/_components/words-panel.tsx` (`WordsPanel`, `SortHeader`, `RatingFilter` type, `matchesFilter`, `filterLabel`, `FILTER_OPTIONS`, `COMPARE`, `FIRST_ORDER`) | `words-panel.tsx`, `sort-header.tsx`, `history/_lib/rating-filter.ts` (type: progress-panel and history-screen also use it), `matches-filter.ts`, `filter-label.ts`, `filter-options.ts` (`filterLabel` uses it, so it can't stay private). `COMPARE`, `FIRST_ORDER`, `PAGE_SIZE` stay. |
| `history/_components/word-in-context.tsx` | one component. No change. |
| `history.module.css` | `.tab` → `history-screen.module.css`; `.statTile` → `stat-tile.module.css`; `.learnTrack .learnBar` → `improvement-story.module.css`; `.keySwatch` → `key-item.module.css` |
| `account/_components/account-screen.tsx` (`AccountScreen`, `ProfileForm`, `DeleteAccount`) | `account-screen.tsx`, `profile-form.tsx`, `delete-account.tsx` |
| `change-password/_components/change-password-screen.tsx` | one component. No change. |
| `admin/_components/admin-screen.tsx` (`AdminScreen`, `NoticeAlert`, `useConfirm`, `WordForm`, `FindWord`, `AddWord`, `ImportWords`, `DeleteList`; types `ImportResult`, `Notice`, `ConfirmState`, `WordFormValues`) | `admin-screen.tsx`, `notice-alert.tsx`, `notice.ts` (type, used by 4 files), `use-confirm.tsx` (+ `ConfirmState`), `word-form.tsx` (+ `WordFormValues`), `find-word.tsx`, `add-word.tsx`, `import-words.tsx` (+ `ImportResult`), `delete-list.tsx` |

### Single-route slices

| File | Split into |
| --- | --- |
| `search-words/_components/search-screen.tsx` | after plan 5 it's one component (`useJson` gone); `PAGE_SIZES` stays. Optional: extract the results table as `words-table.tsx`. |
| `download-words/_components/download-screen.tsx` (`DownloadScreen`, `exportHref`) | `download-screen.tsx`, `export-href.ts`. `PRESETS` stays. |
| `itranslate/_components/translate-screen.tsx` (`TranslateScreen`, `languageName`) | `translate-screen.tsx`, `itranslate/_lib/language-name.ts` |
| `itranslate/_lib/translate-in-browser.ts` | one export + `Translation` type. No change. |
| `contact-us/_components/contact-screen.tsx` | one component; `EMAIL` regex stays. No change. |
| `credits/_components/references-screen.tsx` (`ReferencesScreen`, `Entries`) | `references-screen.tsx`, `entries.tsx`. `RESEARCH`, `TECHNOLOGY` stay. |
| `restore/_components/restore-screen.tsx` | one component; `BAD_LINK` stays. No change. |
| `style-guide/_components/style-guide.tsx` | one component (only constants beside it). No change. |
| `app/providers.tsx` | one component. No change. |

### API contract types (D9)

`SavedAnalysis` (exported from `app/api/history/[id]/route.ts:9`) and `ProgressData` (`app/api/progress/route.ts:8`) are exported from route files and imported by client components. `HistoryItem` is a hand-written client copy of a `GET /api/history` row (`history-screen.tsx:53`).
- **Recommended:** move all three to `@repo/core` (`packages/core/src/types.ts`, or a new `api-types.ts`, exported from its `index.ts`), next to `Paginated` and `RatingEvent`, which are already API contract types there. Have `GET /api/history` declare its row type from the same definition, so the client copy can't drift.
- Otherwise: `src/lib/api-types/saved-analysis.ts`, `progress-data.ts`, `history-item.ts`.
- Either way, the route files then export only their HTTP handlers.

---

## 4. Phase 4B (D8): server code

Same rule for the server modules (after plan 3B moved them under `app/api/_lib/`):

| File | Split into |
| --- | --- |
| `http.ts` (`HttpError`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `route`, `parseJson`, `parseSearchParams`, `parseId`, `csvResponse`; private `notifyOperator`, `errorResponse`) | `http-error.ts`, `bad-request.ts`, `unauthorized.ts`, `forbidden.ts`, `not-found.ts`, `api-route.ts` (exports `route`; not named `route.ts`, so it never looks like a route handler, even in a private folder), `parse-json.ts`, `parse-search-params.ts`, `parse-id.ts`, `csv-response.ts`, `notify-operator.ts`, `error-response.ts` |
| `guards.ts` | `require-session.ts`, `require-admin.ts` |
| `legacy-format.ts` (7 exports + `LegacyUserSource`) | `legacy/decrypt-legacy-password.ts`, `to-legacy-category.ts`, `to-legacy-word.ts`, `to-legacy-text.ts`, `to-legacy-page.ts`, `to-legacy-user.ts` (+ `LegacyUserSource`), `empty-ok.ts` |
| `legacy-auth.ts` (5 exports) | `auth-error-code.ts`, `require-own-session.ts`, `find-user-by-username.ts`, `find-user-by-email.ts`, `send-password-reset.ts` |
| `csv.ts` (+test) | `words-to-csv.ts`, `categories-filename.ts`, `parse-words-csv.ts` (+ `CsvWordRecord`); split the test |
| `dictionary.ts` (+test) | `extract-english-definitions.ts`, `lookup-definition.ts`, `lookup-titles.ts`, `section-anchor.ts`, `fetch-extract.ts`; split the test |
| `analysis/extract.ts` | `validate-upload.ts`, `extract-text-from-file.ts`, `extract-pdf.ts`, `extract-document.ts`, `matches-any.ts`, `starts-with.ts` (+ the `SIGNATURES`/`MAX_PDF_PAGES` constants with their users) |
| `analysis/analyze.ts`, `analysis/history.ts`, `translate.ts`, `db-errors.ts` | already one export each. No change. |

## 5. Manual checks

- [ ] The check script in section 1 prints nothing.
- [ ] `check-types`, `lint`, `test` and `build` pass. Tests: the same count as before, plus the split test files' total.
- [ ] `/style-guide` renders everything it rendered before (it imports nearly every shared component and theme value).
- [ ] Spot-check three screens visually: History (the most splits), Admin, Enhanced text. No styles lost in the CSS splits.
- [ ] `find src/components/ui -name index.tsx` → nothing.

## 6. Noticed, not changed

- Some screens are long even after splitting (`statistics.tsx`, `history-list.tsx`, `admin` `import-words.tsx`). Breaking up the JSX further is optional and not part of this rule.
