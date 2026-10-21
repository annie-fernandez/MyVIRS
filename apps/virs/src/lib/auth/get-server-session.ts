import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { getAuth } from "./get-auth";

/** The current request's session, read once per request however many layouts ask (React cache). */
export const getServerSession = cache(async () => {
  // Read headers first: it marks the route dynamic before auth touches runtime-only env vars.
  const requestHeaders = await headers();
  // Server Components can't set cookies, so a refresh here would move the expiry in the database
  // but not in the browser. SessionProvider's call to /api/auth/get-session refreshes it instead.
  return getAuth().api.getSession({ headers: requestHeaders, query: { disableRefresh: true } });
});
