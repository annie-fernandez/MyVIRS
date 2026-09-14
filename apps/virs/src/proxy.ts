import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only (cookie presence, no database call). Pages re-verify the session
// and role on the server; see src/lib/session.ts.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
