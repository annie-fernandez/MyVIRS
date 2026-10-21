import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { signInUrl } from "@/lib/auth/sign-in-url";

/**
 * Signed-out visitors to a page that needs an account go to the sign-in page, and come back after.
 * Only checks that a session cookie exists (fast; runs on every navigation and prefetch).
 * app/(signed-in)/layout.tsx and the API routes check the session itself.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname + request.nextUrl.search;
  if (!getSessionCookie(request)) return NextResponse.redirect(new URL(signInUrl(path), request.url));
  // A layout isn't told the URL; the (signed-in) layout needs it to send an expired session back here.
  const headers = new Headers(request.headers);
  headers.set("x-virs-path", path);
  return NextResponse.next({ request: { headers } });
}

// The pages in app/(signed-in). Only these: every other URL without a Next page is the Angular app.
// Prefetches are skipped: Next caches a prefetch, so a redirect answered while signed out would be
// replayed after logging in (bouncing between the page and /sign-in). The (signed-in) layout still
// checks the real navigation. Matchers must be literals (Next reads them at build time).
export const config = {
  matcher: [
    {
      source: "/(history|account|change-password|admin)/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
