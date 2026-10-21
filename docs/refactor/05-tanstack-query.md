# Plan 5: TanStack Query, and no more `useEffect`

**Request:** Remove every `useEffect` used for API calls or data fetching, and every one that computes values that could be derived. Install and use TanStack Query; `apiFetch` stays and does the actual requests.
**Depends on:** plan 2 (recommended). Do this **before** plan 1, which builds on step 1 here.
**Size:** L

---

## 1. Inventory: every `useEffect` in `src` (12 total, verified with grep)

| # | File:line | What it does | Kind | Replacement |
| --- | --- | --- | --- | --- |
| E1 | `components/history/history-screen.tsx:115` | `GET /api/progress` | Fetch | `useQuery(progressQuery)` |
| E2 | `components/history/history-screen.tsx:318` | `GET /api/history?page` (+ goes back a page when the current one is empty) | Fetch | `useQuery(historyPageQuery(page))` + `useMutation` for delete |
| E3 | `components/analysis/definition-modal.tsx:44` | `GET /api/dictionary/:word`, with a module-level `Map` cache | Fetch | `useQuery(dictionaryQuery(word))`, `staleTime: Infinity`; the `Map` is deleted |
| E4 | `components/analysis/definition-modal.tsx:144` | `GET /api/ratings/:word` when signed in | Fetch | `useQuery(wordRatingsQuery(word), { enabled: signedIn })` |
| E5 | `components/words/search-screen.tsx:35` (`useJson`) | `GET /api/words?…` | Fetch | `useQuery(wordsQuery(params))` + `placeholderData: keepPreviousData` |
| E6 | `components/words/search-screen.tsx:77` | Debounced input → URL `q` | Derived / sync | Debounced **callback** in the input's `onChange` (no effect); read `q` from the URL |
| E7 | `components/words/search-screen.tsx:90` | `GET /api/words/:value` (which lists contain the typed word) | Fetch | `useQuery(wordLookupQuery(q), { enabled: q !== "" })` |
| E8 | `components/admin/admin-screen.tsx:128` | `GET /api/admin/words?value=` (re-run by a `revision` counter) | Fetch | `useQuery(adminWordQuery(value))`; mutations invalidate it, so `revision` is deleted |
| E9 | `components/analysis/analyze-screen.tsx:71` (`useDraft`) | Read the draft from `sessionStorage` after mount | Storage read (derived) | `useSessionStorage` from `@mantine/hooks` (already installed) |
| E10 | `lib/analysis-store.tsx:31` | Read the latest analysis from `sessionStorage` after mount, then set `hydrated` | Storage read (derived) | `useSyncExternalStore` over `sessionStorage`; the provider is deleted |
| E11 | `components/layout/account-menu.tsx:48` | Open the log-in / register pop-up when the URL has `?login=1` / `?register=1` | Derived state | Compute `opened` during render from the URL and the session |
| E12 | `components/layout/account-menu.tsx:61` | Copy the session into Angular's `localStorage` keys | External sync | **Plan 1** moves it into `SessionProvider` as a `useQuery` (`queryFn` syncs). Leave it until then. |

After plans 5 and 1, `grep -rn "useEffect\|useLayoutEffect" src` should return **nothing**. Step 10 adds a lint rule so new ones get flagged.

**`apiFetch` stays as it is** (`src/lib/api-client.ts`). It already throws `ApiClientError` with the server's message, which is exactly what a `queryFn` should do. Every query and mutation below calls it.

---

## 2. Install

```sh
pnpm --filter virs add @tanstack/react-query@5.104.1
```

- Pin **exactly** `5.104.1`. It's the newest release more than two weeks old (2026-10-02); 5.104.2 to 5.104.4 came out between Oct 11 and Oct 17. Peer dependency is React `^18 || ^19`, so it works with React 19.3.
- Optional: `@tanstack/react-query-devtools@5.104.1` as a dev dependency, rendered only in development. Not needed.
- Optional: `@tanstack/eslint-plugin-query`, which catches missing query-key dependencies. Add it to `packages/eslint-config/next.js` if you want it. That's a change to a shared package, so it's your call.

## 3. Shared pieces

### Step 1: the `QueryClient` and provider

Following `node_modules/next/dist/docs/01-app/02-guides/client-side-data-fetching/tanstack-query.md`: a new client per server render, one shared client in the browser.

New `src/lib/get-query-client.ts` (`"use client"` isn't needed in a plain module, but it is only imported from client code):

```ts
import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./api-client";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data here changes only when this user changes it (and those mutations update the cache).
        staleTime: 30_000,
        // A 4xx (not signed in, not found, bad input) won't fix itself; only retry network and server errors.
        retry: (failures, error) => !(error instanceof ApiClientError && error.status >= 400 && error.status < 500) && failures < 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** One client per server render, one shared client in the browser. */
export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
```

`app/providers.tsx`: wrap children in `<QueryClientProvider client={getQueryClient()}>`, inside `MantineProvider`. The root layout renders `Providers`, so the client covers every screen; no per-route providers.

`ApiClientError.status === 0` means a network error (`api-client.ts:28`), so it still retries.

### Step 2: one query-key contract

New `src/lib/query-keys.ts`, a **single** exported object (so it already meets plan 4's rule). The Next guide: "keep the key and query options together so both call sites share the same identity". Mutations in one feature invalidate keys owned by another (rating a word in the definition pop-up updates History's progress), so the keys live in one shared file:

```ts
/** Every TanStack Query key in the app. Mutations invalidate by these prefixes. */
export const queryKeys = {
  session: ["session"] as const,                       // plan 1, SessionProvider
  progress: ["progress"] as const,                      // GET /api/progress
  history: ["history"] as const,                        // prefix for every page
  historyPage: (page: number) => ["history", "page", page] as const,
  savedAnalysis: (id: string) => ["history", "item", id] as const,
  dictionary: (word: string) => ["dictionary", word.toLowerCase()] as const,
  wordRatings: (word: string) => ["ratings", word.toLowerCase()] as const,
  words: (params: string) => ["words", "list", params] as const,   // the URLSearchParams string
  wordLookup: (value: string) => ["words", "lookup", value.toLowerCase()] as const,
  adminWords: (value: string) => ["admin-words", value.toLowerCase()] as const,
};
```

Each feature's `queryOptions(...)` lives **next to that feature** (plan 3 places them). Each one is a small file exporting one function, for example `progressQuery`, which combines `queryKeys.progress` with `queryFn: () => apiFetch<ProgressData>("/api/progress")`.

---

## 4. Per-file changes

### Step 3: History (E1, E2) – `components/history/history-screen.tsx`

The uncommitted reformat of this file (see the overview) needs a decision before you start.

**Progress (`SignedIn`).**
- Delete `ProgressState`, `useState<ProgressState>` and the effect.
- `const progress = useQuery({ ...progressQuery(), select: (data) => ({ ...data, words: summarizeWords(data.ratings) }) })`. `select` re-runs only when the data changes, so the `useMemo` at the old line 127 goes away (a derived value, as you asked).
- `ProgressGate` takes the query result: `isPending` → the same Skeletons; `isError` → the same Alert with `errorMessage(progress.error)`; otherwise `children(progress.data)`.
- `rate(word, rating, context)` → `useMutation`, optimistic exactly as it works today:
  - `mutationFn: (vars) => apiFetch<RatingEvent>("/api/ratings", { method: "POST", json: vars })`
  - `onMutate`: `await queryClient.cancelQueries({ queryKey: queryKeys.progress })`, keep `previous = getQueryData`, `setQueryData` with the pending event appended, `return { previous }`.
  - `onError`: `setQueryData(queryKeys.progress, context.previous)`.
  - `onSettled`: `invalidateQueries({ queryKey: queryKeys.wordRatings(word) })`, so the definition pop-up shows the new rating next time.
  - `WordsPanel`'s `onRate` keeps its signature: pass `mutateAsync`. `WordsPanel.rate` still catches and shows "We couldn't save your rating…".
- `addRating` and the `onRated` prop are **deleted**. The definition pop-up now updates the progress cache itself (step 4), so `WordsPanel` no longer passes `onRated` to `DefinitionModal`.

**Passages list (`HistoryList`).**
- Delete `ListState`, `load`, the effect, and the `opening` / `deleting` state.
- `const list = useQuery({ ...historyPageQuery(page), placeholderData: keepPreviousData })`. The rows that are already shown stay on screen while the next page loads, as now.
- Loading branch: `list.isPending` → the Skeleton rows (same markup). Error: `list.isError`. Empty: `list.data.total === 0`.
- **Open** → `const openAnalysis = useMutation({ mutationFn: (id: string) => queryClient.fetchQuery(savedAnalysisQuery(id)), onSuccess: (saved) => { setAnalysis({...}); router.push("/enhanced-text-result"); } })`. "Which row is opening" becomes `openAnalysis.isPending && openAnalysis.variables === item.id`; "any row opening" becomes `openAnalysis.isPending`. Note: today, after a successful open, the button stays in its loading state until the navigation finishes (`setOpening(null)` only runs on error). With a mutation, `isPending` ends when `onSuccess` returns, before the navigation completes. To keep the spinner, `await` a navigation-pending signal, or simply keep it as it is with `isPending || isSuccess`.
- **Delete** → `useMutation({ mutationFn: (id) => apiFetch(`/api/history/${id}`, { method: "DELETE" }), onSuccess: () => { if (list.data?.items.length === 1 && page > 1) setPage(page - 1); invalidate queryKeys.history and queryKeys.progress (the "Passages analyzed" count); setToDelete(null); }, onError: (e) => { setToDelete(null); setActionError(errorMessage(e)); } })`. The "step back from an empty last page" logic moves from the old `load()` into this `onSuccess`: deleting is the only action here that can empty a page.
- `actionError` stays as local state (it's UI state, not server state) and is set from both mutations' `onError`.

### Step 4: Definition pop-up (E3, E4) – `components/analysis/definition-modal.tsx`

- Delete `State`, the `cache` Map (lines 27-28) and the effect.
- `const definition = useQuery({ ...dictionaryQuery(word), enabled: word !== "" })` with `staleTime: Infinity, gcTime: Infinity` in `dictionaryQuery`. That's the old "each word is fetched once per visit" comment, now done by the cache. Map `isPending` / `isError` / `data` onto the three branches exactly as they are now. Watch out: when `enabled` is false, `isPending` is true. The modal is closed then (`target === null`), so nothing shows.
- `WordRating`:
  - `const ratings = useQuery({ ...wordRatingsQuery(word), enabled: signedIn })`. Replace `history === null` with `ratings.isPending`; replace `setError` for the load error with `ratings.error`.
  - `rate` → `useMutation`, optimistic on `queryKeys.wordRatings(word)` (prepend the pending row; roll back `onError` and show "We couldn't save that rating…").
  - `onSuccess(saved)`: `setQueryData(queryKeys.progress, (data) => data && { ...data, ratings: [...data.ratings, saved] })`. That's what the old `onRated` → `addRating` did, without a refetch. (Only if History has already loaded progress; otherwise `data` is `undefined` and nothing happens.)
  - Delete the `onRated` prop from `DefinitionModal` and `WordRating`, and from their call sites (`words-panel.tsx:206`).
  - `signedIn` still comes from `authClient.useSession()` until plan 1 switches it to `useSession()`.

### Step 5: Search the word lists (E5, E6, E7) – `components/words/search-screen.tsx`

- Delete `useJson` and the `Load<T>` type.
- **The URL holds the search term.** `const q = searchParams.get("q") ?? ""`. Use `q` wherever `debounced` is used now (query params, lookup, the count label "starting with …").
- The input keeps local state (`search`) so typing stays instant. In `onChange`: `setSearch(value); pushQuery(value.trim())`, where `const pushQuery = useDebouncedCallback((value: string) => update({ q: value || null }), 300)` from `@mantine/hooks`. The clear button calls `setSearch(""); update({ q: null })` directly (no delay). Check the Mantine 9 `useDebouncedCallback` signature (`node_modules/@mantine/hooks`) for a `flush`/`cancel` method: clearing should cancel a pending debounced update.
- `const words = useQuery({ ...wordsQuery(query.toString()), placeholderData: keepPreviousData })`. The faded "refreshing" state becomes `words.isPlaceholderData` (previous page shown while the next one loads); the first load is `words.isPending`.
- Lookup: `useQuery({ ...wordLookupQuery(q), enabled: q !== "" })`. In its `queryFn`, catch `ApiClientError` with status 404 and return `[]`. Today every error returns `[]` (`search-screen.tsx:98`; the ternary returns `[]` on both sides). Keep that: catch everything → `[]`, since this is a hint, not the main result. Render `const lookup = q ? lookupQuery.data ?? [] : []`.
- Known existing behavior to keep: browser back/forward changes the URL but not the input's text. Don't "fix" that here.

### Step 6: Admin (E8) – `components/admin/admin-screen.tsx`

- `FindWord`: delete `entries` state and the effect. `const lookup = useQuery({ ...adminWordQuery(value), enabled: value !== "" })`. Show `lookup.error` in the existing `NoticeAlert` slot (red) when there's no other notice; `entries` becomes `lookup.data`. The "isn't in any list yet" text shows when `value && lookup.data?.length === 0`.
- Delete the `revision` prop, `AdminScreen`'s `revision` state, `changed()` and every `onChanged` prop. Instead, each mutation calls one shared `invalidateWordLists(queryClient)`, which invalidates `["admin-words"]` and `["words"]` (so Search shows the change too).
- Convert the five writes to `useMutation`, keeping their messages and notices exactly:
  1. delete word (`DELETE /api/admin/words/:id`), inside the confirm dialog's `run`
  2. edit word (`PATCH /api/admin/words/:id`)
  3. add word (`POST /api/admin/words`; keep the `parseWordCategory` normalization comment)
  4. import CSV (`POST /api/admin/words/import`); `busy` → `isPending`, `result` → `data`, `error` → `error`
  5. delete a whole list (`DELETE /api/admin/words?category=`)
- `useConfirm` and `WordForm` keep their own `busy`/`saving` state. `WordForm` awaits an async `onSubmit` callback, so pass `mutateAsync`, wrapped so the existing try/catch notices still work.

### Step 7: Analyze screen (E9, plus invalidation) – `components/analysis/analyze-screen.tsx`

- `useDraft` → `const [text, setText] = useSessionStorage({ key: DRAFT_KEY, defaultValue: "", serialize: (value) => value, deserialize: (value) => value ?? "" })`.
  - Pass `serialize`/`deserialize` as plain strings: Mantine JSON-encodes by default, and existing drafts in users' `sessionStorage` are plain strings (`analyze-screen.tsx:82`).
  - Mantine guards storage access and, by default, reads it after mount (`getInitialValueInEffect`), so server and first client render match. That effect sits inside Mantine, not in our code.
  - Empty text: today the key is removed when the box is empty. Use the hook's `removeValue` when `value === ""`, or accept an empty string being stored. Either is fine.
- `analyze()` → `useMutation`. It isn't an effect, but it must invalidate cached History data now that History is cached. In `onSuccess`, when `historyId` is set: `invalidateQueries({ queryKey: queryKeys.history })` and `({ queryKey: queryKeys.progress })`, then `setAnalysis(...)` and `router.push(...)`. Keep `running` (which button started it) as `mutation.variables` (the `View`) while `isPending`; keep the OCR progress state as it is (local UI state). Note the same "spinner until the navigation finishes" detail as History's Open.

### Step 8: Latest analysis store (E10) – `lib/analysis-store.tsx`

Replace the context and provider with a small external store read by `useSyncExternalStore`. No effect, no provider, and the "hydrated" flag becomes a derived value:

```ts
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: StoredAnalysis | null = null;

function read(): StoredAnalysis | null {
  let raw: string | null = null;
  try { raw = sessionStorage.getItem(STORAGE_KEY); } catch { /* blocked storage: no analysis */ }
  // Same string → same object, so React doesn't re-render (useSyncExternalStore needs a stable snapshot).
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try { cachedValue = raw ? (JSON.parse(raw) as StoredAnalysis) : null; } catch { cachedValue = null; }
  }
  return cachedValue;
}

export function setAnalysis(next: StoredAnalysis) { /* write sessionStorage in try/catch; if it fails (quota), keep `next` in memory: set cachedRaw = JSON.stringify(next) and cachedValue = next; then notify listeners */ }

/** `undefined` until the browser has read storage (server render and hydration), then the analysis or null. */
export function useAnalysis(): StoredAnalysis | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}
```

- `undefined` from the server snapshot replaces `hydrated === false`. `ResultsScreen` shows the `Loader` while `analysis === undefined`, the empty state when it's `null`, and otherwise the results. No flash of "Nothing analyzed yet".
- The in-memory fallback matters: `analysis-store.tsx:46` says very large documents can exceed the storage quota and "the result still lives in memory". Keep that behavior.
- Callers: `analyze-screen.tsx:93` and `history-screen.tsx` use `const { setAnalysis } = useAnalysis()`; change them to import `setAnalysis` directly. `results-screen.tsx:79` destructures `{ analysis, hydrated }`; update it.
- Delete `AnalysisProvider` and remove it from `app/providers.tsx`. Update the README "Results" bullet (`src/lib/analysis-store.tsx` still holds it; the wording stays true).

### Step 9: Account menu (E11) – `components/layout/account-menu.tsx`

Today an effect opens a pop-up when `?login=1` or `?register=1` is in the URL and the visitor is signed out. Derive it instead:

- Keep `useDisclosure` for opening by click (rename to make that clear, for example `loginClicked`).
- `const loginOpened = loginClicked || (loginRequested && !session && !isPending)`, and the same for register.
- Closing has to clear the URL request, or the derived value reopens the pop-up. `onClose`: close the disclosure, and if the URL has `login`/`register`, `router.replace` to the same path without them (keep `next` only while the log-in pop-up is open; dropping it on close matches today, where closing simply leaves it unused).
- Switching between pop-ups (log-in → register, log-in → recovery) must clear the URL flag too, or two pop-ups stack. Write one small `closeRequested()` helper (plan 4 gives it its own file) that every `onClose` and switch calls.
- After plan 1, `isPending` disappears from this expression (the session comes from the server).

E12 (the `syncLegacySession` effect) stays until plan 1.

### Step 10: stop new effects from coming back

In `apps/virs/eslint.config.js` (the app's own config, not the shared package):

```js
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [
  ...nextJsConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["warn", {
        paths: [{ name: "react", importNames: ["useEffect", "useLayoutEffect"],
          message: "Fetch with TanStack Query; derive values during render. See docs/refactor/05-tanstack-query.md." }],
      }],
    },
  },
];
```

It's a warning, since every rule in this repo is one (`eslint-plugin-only-warn`). It catches `import { useEffect } from "react"`, not `React.useEffect`; the codebase never uses the `React.` form.

---

## 5. Optional (D10): other API calls that aren't effects

These don't use effects and don't touch cached data, so they're fine as they are. Convert them to `useMutation` only if you want every API call to look the same:

- `components/info/contact-screen.tsx:32` `POST /api/contact`
- `components/layout/account-menu.tsx:199` `RecoveryModal` (raw `fetch` to `/api/user/recovery*`)
- `components/tools/translate-screen.tsx`, `translateInBrowser` (Google, not our API)
- Auth forms (`authClient.*`): leave them; Better Auth returns `{ data, error }` rather than throwing.

## 6. Not doing: server prefetching

The Next guide shows prefetching on the server and passing the data through `<HydrationBoundary>`, so data arrives with the first paint. Every query here is either user-specific and loaded after interaction, or cheap. Client-only fetching keeps the current Skeleton behavior. A later candidate: prefetch `/api/progress` in `(signed-in)/history/page.tsx`.

## 7. Manual checks

- [ ] History: progress loads (Skeletons first); rating in Your words updates at once, and survives a reload; with the network offline, a rating rolls back and shows the error. Passages: paging keeps the old rows until the new ones arrive; deleting the only row on page 2 goes back to page 1; deleting updates the "Passages analyzed" count; Open goes to Enhanced text.
- [ ] Definition pop-up: the second open of the same word is instant (no request in the Network tab); rating there shows in History → Your words without a reload.
- [ ] Search: typing updates the URL after 300 ms; the clear button clears at once; paging fades the old rows; the "is in" hint appears; a reload keeps the filters.
- [ ] Admin: find, edit, add, import and delete-list all refresh the table, and Search shows the change.
- [ ] Analyze: the draft survives leaving and coming back, including drafts saved *before* this change; analyzing while signed in, then opening History, shows the new passage straight away.
- [ ] Results: reload `/enhanced-text-result` → Loader, then the results (no flash of the empty state). Very large result (if you have one): it still shows after the quota error.
- [ ] `/dashboard?login=1` signed out → log-in pop-up; closing it removes `?login=1`; it doesn't reopen; Register from inside it shows one pop-up only.
- [ ] `grep -rn "useEffect\|useLayoutEffect" src` → only `account-menu.tsx` (E12) until plan 1, then nothing.
