import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAuth } from "./auth";

export async function getServerSession() {
  // Read headers first: it marks the route dynamic before auth touches runtime-only env vars.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

export async function requirePageSession(returnTo: string) {
  const session = await getServerSession();
  if (!session) redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  return session;
}

/** Non-admins get a 404 so the admin area is not advertised. */
export async function requirePageAdmin(returnTo: string) {
  const session = await requirePageSession(returnTo);
  if (session.user.role !== "admin") notFound();
  return session;
}
