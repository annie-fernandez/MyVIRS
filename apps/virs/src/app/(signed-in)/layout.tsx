import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/lib/auth/get-server-session";
import { signInUrl } from "@/lib/auth/sign-in-url";

/**
 * Every page in this group needs an account. src/proxy.ts has already sent visitors without a session
 * cookie to the sign-in page; this catches a cookie whose session has expired or been revoked. A failed
 * session read isn't caught here: on a page that needs an account it should show app/error.tsx.
 */
export default async function SignedInLayout({ children }: { children: ReactNode }) {
  if (!(await getServerSession())) {
    // src/proxy.ts passes the page's URL along, so the visitor comes back here after logging in.
    const path = (await headers()).get("x-virs-path") ?? "/dashboard";
    redirect(signInUrl(path) as Route);
  }
  return children;
}
