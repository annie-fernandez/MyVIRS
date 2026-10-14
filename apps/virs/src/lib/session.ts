import "server-only";
import type { Route } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "./auth";

export async function getServerSession() {
  // Read headers first: it marks the route dynamic before auth touches runtime-only env vars.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

/** Signed-out visitors go to the home screen with the login dialog open, then come back here. */
export async function requirePageSession(returnTo: string) {
  const session = await getServerSession();
  if (!session) redirect(`/dashboard?login=1&next=${encodeURIComponent(returnTo)}` as Route);
  return session;
}

/** Non-admins get a 404 so the admin area is not advertised. */
export async function requirePageAdmin(returnTo: string) {
  const session = await requirePageSession(returnTo);
  if (session.user.role !== "admin") notFound();
  return session;
}
