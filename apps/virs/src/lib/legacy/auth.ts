import "server-only";
import { getDb, user } from "@repo/db";
import { APIError } from "better-auth";
import { eq, sql } from "drizzle-orm";
import { forbidden, unauthorized } from "../api/http";
import { getAuth } from "../auth";

export function authErrorCode(error: unknown): string | undefined {
  if (!(error instanceof APIError)) return undefined;
  const body = error.body as { code?: string } | undefined;
  return body?.code;
}

/** The legacy account endpoints are keyed by user name; only that user may use them. */
export async function requireOwnSession(request: Request, userName: string) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw unauthorized();
  if (session.user.username?.toLowerCase() !== userName.trim().toLowerCase()) throw forbidden();
  return session;
}

export async function findUserByUsername(userName: string) {
  const [match] = await getDb()
    .select()
    .from(user)
    .where(eq(user.username, userName.trim().toLowerCase()))
    .limit(1);
  return match;
}

export async function findUserByEmail(email: string) {
  const [match] = await getDb()
    .select()
    .from(user)
    .where(eq(sql`lower(${user.email})`, email.trim().toLowerCase()))
    .limit(1);
  return match;
}

/** Sends a reset link that lands on the legacy /restore page (?token=…). */
export async function sendPasswordReset(request: Request, email: string | undefined) {
  if (!email) return;
  await getAuth().api.requestPasswordReset({
    body: { email, redirectTo: "/restore" },
    headers: request.headers,
  });
}
