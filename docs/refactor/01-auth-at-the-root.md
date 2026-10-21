# Plan 1: Auth at the root, with dumb components

**Request:** Components shouldn't know about auth. The History screen, for example, shouldn't have a signed-in and a signed-out version. Put the one app-wide auth code at the root layout, around everything else, and remove auth code from every consumer. Redirect signed-out visitors server-side (proxy or a server check). The app has server sessions; check they're set up correctly and use them at the layout level.

**Depends on:** plan 5, step 1 (the `QueryClientProvider`) and the plan 5 change to `account-menu.tsx`. Plan 2 should be in place too, so errors from the new server reads have a boundary.
**Size:** M

---

## 1. What exists today (verified)

### Server sessions: yes, real ones, stored in the database

| Check | Result | Evidence |
| --- | --- | --- |
| Session storage | ✅ Postgres (Neon) through Drizzle. `session` table: unique `token`, `expires_at`, index on `user_id`. | `packages/db/src/schema/auth.ts:26-44`, `src/lib/auth.ts:28-31` |
| Secret and base URL | ✅ `BETTER_AUTH_SECRET` must be 32+ characters (zod). `BETTER_AUTH_URL` is set in `apps/virs/.env.local`. | `src/lib/env.ts:7-8` |
| `nextCookies()` plugin | ✅ Present and last, as Better Auth requires | `src/lib/auth.ts:75-76` |
| Session lifetime | Defaults: expires after **7 days**, extended ("refreshed") at most once a day (`updateAge` 1 day). Not configured explicitly. | `better-auth/dist/context/create-context.mjs:147-148` |
| Cookie name | Default `better-auth.session_token` (`__Secure-` prefix on https). No custom prefix. | `better-auth/dist/cookies/index.mjs:261-270` |
| API protection (the real security boundary) | ✅ Every user or admin endpoint checks the session against the database: `requireSession` / `requireAdmin` in `src/lib/api/guards.ts`. Used by 10 routes: `history`, `history/[id]`, `progress`, `ratings`, `ratings/[word]`, and the 5 `admin/words/*`. Legacy `/api/user/*` routes use `requireOwnSession` (`src/lib/legacy/auth.ts:15`). | grep `requireSession\|requireAdmin` in `app/api` |
| Page protection | Per page: `requirePageSession(returnTo)` in `account/page.tsx:9` and `change-password/page.tsx:8`; `requirePageAdmin` in `admin/page.tsx:8` (non-admins get a 404). `history/page.tsx:9` reads the session and passes `signedIn` down. | `src/lib/session.ts` |
| `proxy.ts` / `middleware.ts` | ❌ None | `ls src/proxy.ts` |
| Analyses saved to history | ✅ Server-side. `saveToHistory` reads the session from the request and saves nothing for anonymous users. | `src/lib/analysis/history.ts:14-26` |

### Problems found in the session setup

1. **`getServerSession()` isn't memoized** (`src/lib/session.ts:7`). Once the root layout, a group layout and a page each call it in the same request, that's 2–3 identical database reads. Wrap it in React `cache()`, as the Next DAL guide does.
2. **Server Components can refresh the session in the database without being able to set the cookie.** Better Auth's `nextCookies` skips the refresh only when the request has the `RSC: 1` header (client-side navigations; `better-auth/dist/integrations/next-js.mjs:57-70`). On a full page load there's no such header. `getSession` then extends `expires_at` in the database and tries to re-set the cookie, and Next forbids setting cookies from a Server Component. The attempt is swallowed (`try { cookieHelper.set(...) } catch {}`), so the database and the browser cookie disagree. Fix: in Server Components, call `getSession({ headers, query: { disableRefresh: true } })` (the option exists: `better-auth/dist/api/routes/session.d.mts:61`). Let a route handler do the refresh; route handlers can set cookies.
3. **The only thing that keeps sessions alive today is the client.** `authClient.useSession()` (in `AccountMenu`, which is on every page) calls `GET /api/auth/get-session` after each page load. That route handler is what slides the 7-day expiry forward. If this plan removed every client session call, users would be signed out 7 days after logging in, however active they were (except through API routes like `/api/progress`). **The new `SessionProvider` keeps one client call** for this (section 4, step 4).
4. **The client receives more than it needs.** `GET /api/auth/get-session` returns the session row, including its `token`, to JavaScript. The cookie is `httpOnly`, but the same value then sits in JS memory. Passing a small DTO from the server (section 4, step 2) means the UI never holds the token. The keep-alive call still receives it but ignores everything except `user`.
5. Already known, out of scope: `rateLimit: { storage: "memory" }` does nothing across serverless instances (see `docs/sprint-card-history-schema.md`).

### Every place outside `lib/` that touches auth today

| File | What it does | After this plan |
| --- | --- | --- |
| `app/history/page.tsx:3,9-10` | `getServerSession()` → `signedIn` prop | Removed. The page becomes `<HistoryScreen />` under `(signed-in)`. |
| `components/history/history-screen.tsx:85,97,110,260-286` | `signedIn` prop, `SignedIn` / `SignedOut` components | `signedIn` prop and `SignedOut` deleted. `SignedIn`'s body becomes the screen. |
| `app/account/page.tsx:4,9-20` | `requirePageSession`, builds the `AccountUser` prop and checks `userLevel` | `<AccountScreen />`. The user comes from `useRequiredUser()`, and the `userLevel` check moves to the DTO. |
| `app/change-password/page.tsx:3,8` | `requirePageSession` | Removed (the group layout does it) |
| `app/admin/page.tsx:3,8` | `requirePageAdmin` | Removed (`(signed-in)/admin/layout.tsx` does it) |
| `components/layout/account-menu.tsx:36,48-63,66-68,145-146,156` | `authClient.useSession()`, two effects (open log-in from the URL, `syncLegacySession`), sign-in and sign-out | Reads `useSession()` from context. Sign-out goes through `useSignOut()`. The sign-in call stays: it's the log-in form. |
| `components/analysis/results-screen.tsx:29,165` | `authClient.useSession()` in `HistoryNote` | `useSession()` from context |
| `components/analysis/definition-modal.tsx:12,138-142,171` | `authClient.useSession()` and `isPending` in `WordRating` | `useSession()` from context. The `isPending` branch is deleted. |
| `components/account/register-form.tsx:8-9,25,43` | `authClient.signUp.email`, `syncLegacySession` | `signUp` stays (it's the form). `syncLegacySession` becomes `useSessionChanged()`. |
| `components/account/account-screen.tsx:11-12,64-78,129-137` | `changeEmail`, `updateUser`, `getSession` + `syncLegacySession`, `deleteUser` + `syncLegacySession(null)` | The auth calls stay (it's the profile form). The session sync goes through `useSessionChanged()` / `useSignOut()`. |
| `components/account/password-form.tsx:23` | `authClient.changePassword` | No change (it's the form) |
| `components/account/restore-screen.tsx:33` | `authClient.resetPassword` | No change (it's the form) |

**What "dumb components" means here.** After this plan, no screen or shared component:
- fetches, validates or caches the session (`authClient.useSession`, `getServerSession`, `requirePage*`);
- receives `signedIn` / `user` props just to decide whether it's allowed to render;
- writes the Angular `localStorage` keys.

Screens **may** read the already-loaded user from context (`useSession()`) when the UI genuinely differs. Examples: the header shows "Log in" or the account menu; the definition pop-up offers rating or "Log in to rate"; the results screen says "Saved to your history". Those components live on public pages, so a route gate can't decide for them. The forms that *are* the auth feature (log in, register, recovery, profile, password, delete account) still call `authClient.*`; the side effects that follow each call (refreshing the session, clearing caches, updating Angular's keys) live in one place.

---

## 2. What Next 16 and Better Auth recommend, and the one catch

From `node_modules/next/dist/docs/01-app/02-guides/authentication.md`, "Layouts and auth checks":

> Due to Partial Rendering, be cautious when doing checks in Layouts as these don't re-render on navigation, meaning the user session won't be checked on every route change.
> A layout also does not control whether the rest of the route renders … a layout that hides or swaps them does not stop them from running or from appearing in the RSC Payload.

So **a check in the root layout alone isn't enough**. Moving between two pages under the same layout doesn't run the layout again, and a layout that "hides" its children doesn't stop the page from running. The documented approach has layers. This plan keeps your goal (no auth code in pages or components) and puts each layer in **one** place:

| Layer | Where | Job | Why it's needed |
| --- | --- | --- | --- |
| **Proxy** (optimistic) | `src/proxy.ts` (one file) | No session cookie on a protected URL → redirect to log-in | Runs on **every** request, including client-side navigations and prefetches, so it covers what layouts miss. The guide calls this "a good way to centralize redirect logic". Cookie-only, so it's fast. |
| **Root layout** (read) | `app/layout.tsx` | Read the session once, server-side, and pass a small user DTO to the client through context | The header and any component can show the right thing on the first paint: no "Log in" flash, no client fetch to decide. |
| **Signed-in group layout** (secure) | `app/(signed-in)/layout.tsx`, plus `app/(signed-in)/admin/layout.tsx` for the role | Validate against the database on entry to the group. Admin: role check → 404. | Catches a cookie that exists but is expired or revoked (the proxy can't tell). |
| **API guards** (secure, the real gate) | `src/lib/api/guards.ts` (unchanged) | Every data read or write checks the session | Already in place. This is what actually protects data ("checks close to your data source"). |

Better Auth says the same: `getSessionCookie()` in proxy "is NOT SECURE … only for optimistic redirects", and you still validate in pages, routes or layouts with `auth.api.getSession`. In Next 16 the proxy runs on Node.js and *could* call `auth.api.getSession` on every request. Don't: it runs on every prefetch too, and that would mean a database read per link hover (or a cookie-cache read with D3).

---

## 3. Decisions to confirm before starting

- **D1 – Where signed-out visitors go.** Recommended: `/dashboard?login=1&next=<path>`, the existing flow. `AccountMenu` opens the log-in pop-up from `?login=1` and `afterLogin()` returns to `next`. DESIGN.md: "Log in and registration are pop-ups". The alternative: add `app/sign-in/page.tsx` showing the log-in form as a page, and change the redirect target in two places (proxy and group layout). Your message said "/sign in". Say if you want the page; the rest of the plan doesn't change.
- **D2 – DESIGN.md's "Needs an account" rule.** It currently says: *"don't redirect signed-out visitors away from a feature that needs one. Show the screen with an EmptyState…"*. History follows that rule today, and this plan removes it, as you asked. Rewrite the rule (exact text in step 9).
- **D3 – `session.cookieCache`.** Recommended: `cookieCache: { enabled: true, maxAge: 5 * 60 }`. With it, the root layout's read on every page comes from a signed cookie, not a database query. Trade-off: a session revoked elsewhere (password change with `revokeOtherSessions`, account deleted, admin ban) can keep *reading* for up to 5 minutes. Have `requireAdmin` pass `query: { disableCookieCache: true }` so admin writes always check the database. Better Auth warns that Server Components can't refresh the cookie cache; the keep-alive call in step 4 does it. If you say no, everything else still works, with one session query per page view.
- **D4 – Every page becomes dynamic.** Calling `headers()` in the root layout opts every route out of static prerendering. Today `/dashboard`, `/text`, `/credits` and others are prerendered (that's why `search-words` and `restore` need `<Suspense>` for `useSearchParams` "on a static page"). Afterwards, each page view renders on the server. Recommended: accept it. The pages are light; with D3 there's no database hit; and this is what "server-side auth at the layout level" costs. The streaming guide's alternative (pass an unawaited promise and `use()` it under `<Suspense>`) makes every consumer suspend and isn't worth it for one small read.

---

## 4. Steps

### Step 1: one cached server read of the session

`src/lib/session.ts` (plan 4 later splits this file):

```ts
import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { getAuth } from "./auth";

/** The current request's session, read once per render (React cache). */
export const getServerSession = cache(async () => {
  // Read headers first: it marks the route dynamic before auth touches runtime-only env vars.
  const requestHeaders = await headers();
  // Server Components can't set cookies, so a refresh here would move the expiry in the database
  // but not in the browser. The SessionProvider's call to /api/auth/get-session refreshes it instead.
  return getAuth().api.getSession({ headers: requestHeaders, query: { disableRefresh: true } });
});
```

Delete `requirePageSession` and `requirePageAdmin`. Their only callers are the four pages, and steps 6–7 replace them.

### Step 2: a user DTO that's safe to send to the browser

New `src/lib/session-user.ts`. **No `server-only` import**: the client imports the type.

```ts
import type { UserLevel } from "@repo/core";

/** What the browser is told about the signed-in user. Never the session token. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** As the user typed it (displayUsername), falling back to the stored lower-case username. */
  username: string;
  userLevel: UserLevel | null;
  role: string | null;
  createdAt: string;
}
```

New `src/lib/to-session-user.ts` (`import "server-only"`). It takes the user from `getServerSession()` and returns `SessionUser`. Move the `userLevel` check from `app/account/page.tsx:10` (`USER_LEVELS.includes(...) ? ... : null`) and the `displayUsername ?? username ?? ""` from `account/page.tsx:16` into this function. Convert `createdAt` with `.toISOString()`.

### Step 3: Better Auth config (only with D3)

`src/lib/auth.ts`, inside `betterAuth({...})`:

```ts
session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
```

And `src/lib/api/guards.ts` `requireAdmin`: read the session with `query: { disableCookieCache: true }`. That means changing `requireSession` to accept options, or having `requireAdmin` call `getAuth().api.getSession` itself.

### Step 4: SessionProvider (the one client-side auth module)

New `src/lib/session-provider.tsx` (`"use client"`). Plan 4 splits it into one file per export; for now it holds:

- `SessionContext = createContext<SessionUser | null>(null)`
- `SessionProvider({ user, children })`: renders `<SessionContext value={user}>`. It also runs **one** query that keeps the session alive and keeps the Angular keys in step, replacing the `syncLegacySession` effect at `account-menu.tsx:61-63`:

  ```ts
  useQuery({
    queryKey: queryKeys.session,             // from plan 5's src/lib/query-keys.ts
    queryFn: async () => {
      // GET /api/auth/get-session is a route handler, so it can refresh the session and its cookie.
      const { data } = await authClient.getSession();
      // The Angular screens decide who's signed in from localStorage (see legacy-session.ts).
      syncLegacySession(data?.user ?? null);
      return data?.user.id ?? null;
    },
    refetchOnWindowFocus: true,
    staleTime: 5 * 60_000,
  });
  ```

  This makes the same one request per page load that `authClient.useSession()` makes today, without a `useEffect`.
- `useSession(): SessionUser | null`, which reads the context.
- `useRequiredUser(): SessionUser`, which throws `new Error("useRequiredUser must be used inside app/(signed-in)")` when the user is null. Screens under `(signed-in)` use it, so they get a non-null user without checking. A throw means a bug, and `app/error.tsx` (plan 2) catches it.
- `useSessionChanged(): () => void`, which calls `queryClient.invalidateQueries()` (refetches the session, so Angular's keys update, plus all user data) and `router.refresh()` (re-renders the root layout, which hands the provider the new user). Use it after log-in, sign-up and profile save.
- `useSignOut(): () => Promise<void>`, which runs `await authClient.signOut()`, then `queryClient.clear()` (so the next person on this browser never sees the last user's progress or history), `syncLegacySession(null)`, and `router.refresh()`. Use it for Log out and after Delete account.

`src/lib/legacy-session.ts`: change the parameter type from `Session["user"]` (auth-client) to a structural type it actually reads: `{ name: string; email: string; username?: string | null; displayUsername?: string | null; userLevel?: string | null } | null | undefined`. `authClient.getSession()`'s user fits it. Update `legacy-session.test.ts` only if the types complain; its behavior doesn't change.

### Step 5: the root layout reads the session once

`app/layout.tsx`:

```tsx
export default async function RootLayout({ children }: LayoutProps<"/">) {
  // A database or auth failure must not take down public pages: treat it as signed out here.
  // Protected routes check again in app/(signed-in)/layout.tsx, which does fail loudly.
  const session = await getServerSession().catch((error: unknown) => {
    console.error("[session] could not read the session", error);
    return null;
  });
  const user = session ? toSessionUser(session.user) : null;
  return (
    <html ...>
      <body>
        ...
        <Providers user={user}>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
```

`app/providers.tsx`: accept `user: SessionUser | null`. Order: `MantineProvider` › `QueryClientProvider` (plan 5) › `SessionProvider user={user}` › children (plus `AnalysisProvider`, unless plan 5 already removed it).

### Step 6: the proxy, for optimistic redirects

New `src/proxy.ts`, next to `src/app` (the docs: "inside `src` if applicable"):

```ts
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Signed-out visitors to a page that needs an account go to the log-in pop-up and come back after.
 * Cookie check only (fast, runs on every navigation and prefetch). app/(signed-in)/layout.tsx and
 * the API routes validate the session itself.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const login = new URL("/dashboard", request.url);
  login.searchParams.set("login", "1");
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

// Must match the pages in app/(signed-in). Matchers have to be literals (read at build time).
export const config = {
  matcher: ["/history/:path*", "/account/:path*", "/change-password/:path*", "/admin/:path*"],
};
```

Only these four paths, deliberately. A catch-all matcher would run on the Angular bundle's URLs (everything without a Next page falls through to `public/index.html`) and on `/api/*`, for nothing. (D1: if you choose a `/sign-in` page, change the redirect URL here.)

### Step 7: the `(signed-in)` route group

`git mv` these into a new group; URLs don't change:

```
src/app/history          → src/app/(signed-in)/history
src/app/account          → src/app/(signed-in)/account
src/app/change-password  → src/app/(signed-in)/change-password
src/app/admin            → src/app/(signed-in)/admin
```

New `src/app/(signed-in)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/lib/session";

/** Every page in this group needs an account. The proxy already redirected visitors without a cookie;
 *  this catches a cookie whose session has expired or been revoked. */
export default async function SignedInLayout({ children }: { children: ReactNode }) {
  if (!(await getServerSession())) redirect("/dashboard?login=1");
  return children;
}
```

- A layout doesn't receive the current path, so this rare case has no `next`. The common case (no cookie at all) is the proxy's, and it keeps `next`. If you want `next` here too, have the proxy set a request header (`NextResponse.next({ request: { headers } })` with `x-virs-path`) and read it with `headers()`. It's not worth the extra code.
- Unlike the root layout, **don't** catch errors here. A failed session read on a protected page should reach `error.tsx`, not look like "signed out".
- Typed routes: run `pnpm --filter virs check-types` (it runs `next typegen`). If a generated `LayoutProps<...>` type exists for the group, use it, as `app/layout.tsx` does with `LayoutProps<"/">`; otherwise `{ children: ReactNode }` is fine.
- `getServerSession` is cached (step 1), so the root layout and this layout share one read.

New `src/app/(signed-in)/admin/layout.tsx`:

```tsx
/** Non-admins get a 404 so the admin area isn't advertised. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (session?.user.role !== "admin") notFound();
  return children;
}
```

### Step 8: make every consumer dumb

| File | Change |
| --- | --- |
| `(signed-in)/history/page.tsx` | `export default function Page() { return <HistoryScreen />; }`. Remove the `getServerSession` import and the comment about signed-out visitors. |
| `components/history/history-screen.tsx` | Remove the `{ signedIn }` prop, the `SignedOut` function (lines 260-286) and the ternary at line 97. `SignedIn` becomes the screen body. Remove imports that are now unused: `IconLogin`, `IconUserPlus`, and `ShellLink` if nothing else uses it (the empty-state "Analyze a text" button still does, so `ShellLink` probably stays). Update the doc comment at line 84. |
| `(signed-in)/account/page.tsx` | `return <AccountScreen />;` (keep `metadata`) |
| `components/account/account-screen.tsx` | Delete the `AccountUser` interface. `AccountScreen` and `ProfileForm` read `const user = useRequiredUser()`. Keep `initialValues` from the user (`username` is already the display version in the DTO). After a save: replace lines 77-78 (`authClient.getSession()` + `syncLegacySession`) and `router.refresh()` at 81 with `sessionChanged()` from `useSessionChanged()`. In `DeleteAccount`: replace `syncLegacySession(null); router.push("/dashboard"); router.refresh();` with `await signOut()` (from `useSignOut()`), then `router.push("/dashboard")`. `deleteUser` has already removed the session, so `authClient.signOut()` inside `useSignOut` may answer with an error: have `useSignOut` ignore the sign-out result and always run the cache clear, `syncLegacySession(null)` and `router.refresh()`. Check what `deleteUser` does to the cookie in the Network tab. |
| `(signed-in)/change-password/page.tsx` | Remove `requirePageSession`; the page is just `<ChangePasswordScreen />` |
| `(signed-in)/admin/page.tsx` | Remove `requirePageAdmin`; the page is just `<AdminScreen />` |
| `components/layout/account-menu.tsx` | `const user = useSession()` instead of `authClient.useSession()`. Delete the `isPending` uses: the `loading={isPending}` on the Log in button, and the `isPending` guards in the URL logic that plan 5 rewrote. Delete the `syncLegacySession` effect (61-63), now in `SessionProvider`. `signOut()` → `useSignOut()`. `afterLogin()`: replace `router.refresh()` with `sessionChanged()`, keep `router.push(next)`. In `LoginModal.submit`, delete `syncLegacySession(data?.user …)` (line 156); `sessionChanged()` covers it. |
| `components/account/register-form.tsx` | Delete `syncLegacySession(...)` (line 43). The parent's `onSuccess` already calls `router.refresh()`; change that parent code (`account-menu.tsx:122`) to `sessionChanged()`. |
| `components/analysis/results-screen.tsx` | `HistoryNote`: `const user = useSession(); if (!saved \|\| !user) return null;`. Remove the `authClient` import. |
| `components/analysis/definition-modal.tsx` | `WordRating`: `const signedIn = useSession() !== null;`. Delete `isPending` and `if (isPending) return null;` (line 171). Remove the `authClient` import. Plan 5 already moved the ratings fetch into `useQuery({ enabled: signedIn })`. |
| `src/lib/auth-client.ts` | Keep it. Forms and the provider use it. `Session` type: delete it if nothing imports it any more (`legacy-session.ts` no longer does after step 4). |

After this step, `grep -rn "authClient.useSession\|getServerSession\|requirePage\|syncLegacySession" src/components src/app` should only find `getServerSession` in `app/layout.tsx` and the two group layouts. `authClient.` should remain only in the auth forms (`account-menu` log-in, `register-form`, `password-form`, `restore-screen`, `account-screen`) and in `src/lib`.

### Step 9: docs, in the same change

- `apps/virs/DESIGN.md`, "Messages and states", replace the **Needs an account** bullet with:
  > **Needs an account:** screens that need an account live in `app/(signed-in)`. Signed-out visitors are sent to the log-in pop-up (`/dashboard?login=1&next=<page>`) and return to the screen after logging in. Screens don't check the session themselves; when a shared component's UI differs for a signed-in user (rating a word, the header), it reads `useSession()`.
- `apps/virs/README.md`, the "Pages that need an account" bullet: say they're in `src/app/(signed-in)`, `src/proxy.ts` redirects signed-out visitors, and the group layout re-checks. Mention that `/history` now redirects too.
- README "Sign-in across both UIs": the Mantine side now updates the `localStorage` keys from `SessionProvider` (`src/lib/session-provider.tsx`) on every page load and window focus.

---

## 5. Manual checks

Signed out (private window):
- [ ] `/history`, `/account`, `/change-password`, `/admin` each redirect to `/dashboard?login=1&next=/…`, with the log-in pop-up open. Logging in lands on the page you asked for.
- [ ] Sidebar → History while signed out: same redirect (this is a client-side navigation, so it shows the proxy covers what the layout doesn't).
- [ ] Public pages (`/dashboard`, `/text`, `/search-words`, `/credits`) work. The header shows "Log in" **on first paint**: view the page source, or disable JavaScript; it was a loading button before.
- [ ] Clicking a word in the Enhanced text shows "Log in to rate words…".

Signed in, not an admin:
- [ ] Header shows first name and initials on first paint, with no "Log in" flash.
- [ ] `/history` shows the tabs straight away; there's no signed-out variant left in the code.
- [ ] `/admin` → 404.
- [ ] Rating a word in the pop-up works, and the "Saved to your history" note shows after an analysis.
- [ ] Profile save: the header name updates without a manual reload.
- [ ] Network tab: one `GET /api/auth/get-session` per full page load and on window focus, no more.
- [ ] Open an Angular screen (any `/tests/*` URL): it still sees you as signed in (`localStorage` `currentUser`, `userName`, `level`, `email`).

Signed in as admin: `/admin` works, and the admin endpoints still respond.

Stale cookie: on a **dev Neon branch**, never production, delete your row from `session`, or edit the cookie value in devtools, then open `/history`. Expect a redirect to `/dashboard?login=1` (from the group layout, since the proxy saw a cookie).

Log out: the header switches; History redirects; logging in as a second user never shows the first user's progress (`queryClient.clear()`).

`pnpm --filter virs build`: the route list now shows the pages as `ƒ` (dynamic). That's expected (D4).

---

## 6. Noticed, not changed

- `rateLimit` memory storage (already in `docs/sprint-card-history-schema.md`).
- The sidebar shows History to signed-out visitors (it now leads to the log-in pop-up). Hiding it would be a design change.
- `requirePageAdmin`'s `notFound()` renders Next's default 404 inside the shell, since the app has no `not-found.tsx`.
- With every page dynamic, the `<Suspense>` wrappers in `search-words/page.tsx` and `restore/page.tsx` (needed for `useSearchParams` on static pages) and in `site-shell.tsx:103` may no longer be required. Leave them; they're harmless.
