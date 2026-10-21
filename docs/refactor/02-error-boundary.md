# Plan 2: One app-wide error boundary

**Request:** Add an `error.tsx` for handling errors on routes. One main one; routes don't each need their own.
**Depends on:** nothing. Do it first.
**Size:** S

---

## 1. What exists today

- No `error.tsx`, `global-error.tsx`, `not-found.tsx` or `loading.tsx` anywhere in `src/app` (`find src/app -name 'error.tsx' -o -name 'global-error.tsx'` returns nothing).
- A render error today shows Next's default error screen, which replaces the whole page, header and sidebar included.
- Screens already handle *expected* failures inline, following DESIGN.md ("Error: `Alert color="red"` that says what went wrong and what to do next"). Examples: `history-screen.tsx` "We couldn't load your progress", `search-screen.tsx:152`, `analyze-screen.tsx:305`. **Keep all of them.** The boundary is for *unexpected* errors (a bug in a component, a Server Component that throws, `useRequiredUser()` outside the signed-in group).

## 2. How it works in Next 16.3 (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`)

- `error.tsx` must be a Client Component. It gets `{ error, retry, reset }`.
  - **`retry()`** (new; the docs prefer it) re-fetches and re-renders the segment. Use this one.
  - `reset()` re-renders without re-fetching. Not needed here.
- `app/error.tsx` wraps every page and nested layout **below** the root layout. It does **not** catch errors in `app/layout.tsx` itself. Since `SiteShell` is rendered by the root layout, the boundary shows *inside* the shell, and the header and sidebar stay usable. That's what we want.
- Errors thrown in Server Components reach the client with a generic `message` and a `digest` in production. Don't show either (DESIGN.md: "Never show raw error codes or stack traces").
- `error.tsx` doesn't catch errors in event handlers or in async code after render. Those stay inline Alerts. With plan 5: `useQuery` errors stay inline (`isError` → Alert). Only `useSuspenseQuery` or `throwOnError` would send query errors here, and plan 5 uses neither.
- Errors in the **root layout** need `app/global-error.tsx`, which replaces the whole document: it renders its own `<html>` and `<body>`, without your root layout, global CSS or providers.

## 3. Decision

**D5 – also add `app/global-error.tsx`?** Recommended: **yes, a minimal one.** After plan 1, the root layout awaits the session read. Plan 1 makes that read fail soft (treated as signed out), but anything else that throws in the root layout or `Providers` would hit Next's bare default. You asked for "one main one". `error.tsx` is that one; `global-error.tsx` is the last-resort fallback for the one place `error.tsx` can't reach. Say no and skip step 2.

## 4. Steps

### Step 1: `src/app/error.tsx`

```tsx
"use client";

import { Alert, Button, Group, Stack } from "@mantine/core";
import { IconHome, IconRefresh, IconX } from "@tabler/icons-react";
import { ShellLink } from "@/components/layout/shell-link";
import { PageHeader } from "@/components/ui";

/**
 * Shown in place of any screen that fails to render, inside the site shell, so the header and
 * sidebar keep working. Expected failures (a request that fails) stay as Alerts on their own screen.
 */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Stack gap="xl">
      <PageHeader title="Something went wrong" description="This page didn't load. Try again, or go back to Home." />
      <Alert color="red" icon={<IconX size={18} />} title="We couldn't show this page">
        <Group justify="flex-end" mt="sm">
          <Button component={ShellLink} href="/dashboard" variant="default" leftSection={<IconHome size={16} />}>
            Go to Home
          </Button>
          <Button onClick={() => retry()} leftSection={<IconRefresh size={16} />}>
            Try again
          </Button>
        </Group>
      </Alert>
    </Stack>
  );
}
```

Design-rule check: one filled button, on the right; the other is `default`. Buttons say what they do. The Alert is red with an icon and a full-sentence title. No raw message or digest. No `Marker`, since this isn't a real screen title (the marker is optional). `PageHeader` keeps the panel at the same height as every other screen.

- **No `useEffect` for logging.** The doc example logs in an effect; skip it. It would be the app's only `useEffect` after plan 5, and nothing collects client logs: React already logs caught errors to the console, and Server Component errors are logged on the server with the same `digest`. If error reporting is added later, that's the one justified effect (syncing with an external system).
- Imports: once plans 3–4 are done, the paths become `@/components/shell-link/shell-link` and `@/components/ui/page-header`. Plan 3's move table includes this file.
- The default export is named `Error`, as in the Next docs, which shadows the global `Error`. That's fine because the file doesn't use the global; name it `ErrorPage` if lint complains.

### Step 2 (D5): `src/app/global-error.tsx`

It renders without the root layout, so no `MantineProvider`, theme or CSS. Keep it plain HTML, with inline styles in the palette's spirit and no Mantine components (they'd render unstyled without the provider):

```tsx
"use client";

/** Last resort when the root layout itself fails. Renders its own document, without the app's styles. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32, color: "#1f2328", background: "#f4f5f7" }}>
        <title>Something went wrong · VIRS</title>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something went wrong</h1>
        <p>VIRS couldn&apos;t load. Try again in a moment.</p>
        <button type="button" onClick={() => retry()}>Try again</button>
      </body>
    </html>
  );
}
```

DESIGN.md forbids raw hex values *in screens* and says to use the theme. `global-error` has no theme available, which the Next docs say explicitly. Add a one-line comment saying so, so nobody "fixes" it later. If you'd rather it look branded, the alternative is to import `@mantine/core/styles.css` and wrap it in `<MantineProvider theme={theme}>`. That's more that could fail in a file whose job is to work when things are broken. Not recommended.

### Step 3: docs

- `apps/virs/DESIGN.md`, "Messages and states", after the **Error** bullet, add:
  > A screen that fails to render shows `app/error.tsx` inside the shell (title, a red Alert, *Go to Home* and *Try again*). Don't add per-route `error.tsx` files; handle expected failures inline.
- `/style-guide`: DESIGN.md says to update it whenever a rule changes, so add the error-state Alert pattern (with its two buttons) to the Alerts section, if that section shows state examples. Check `app/style-guide/style-guide.tsx` first and keep it brief.

## 5. Manual checks

- [ ] Temporarily add `throw new Error("test")` at the top of `app/credits/page.tsx`. `/credits` shows the error screen inside the shell, and the sidebar still navigates. Remove the throw, click **Try again**, and the page renders. Revert.
- [ ] Same test in a Client Component (for example the top of `ReferencesScreen`): caught the same way.
- [ ] `pnpm --filter virs build && pnpm --filter virs start` with a test throw in a Server Component: no message or digest appears on screen.
- [ ] (D5) Temporarily throw in `app/layout.tsx`: `global-error` renders, and Try again works once the throw is removed. Revert.
- [ ] An expected failure (for example, turn off Wi-Fi and search words) still shows the inline Alert, not the boundary.

## 6. Noticed, not changed

- There's no `not-found.tsx`. `notFound()` (non-admins on `/admin`) shows Next's default 404. Unknown URLs don't 404 at all: they fall through to the Angular app (`next.config.ts` `fallback`).
- There are no `loading.tsx` files. Screens handle loading themselves (Skeletons), as DESIGN.md asks.
