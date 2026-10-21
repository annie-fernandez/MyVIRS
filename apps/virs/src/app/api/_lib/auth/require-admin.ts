import "server-only";
import { HttpError } from "../http/http-error";
import { requireSession } from "./require-session";

/** An admin's session, or a 401/403. Always checked against the database, so a revoked admin can't keep writing from a cached cookie. */
export async function requireAdmin(request: Request) {
  const session = await requireSession(request, { disableCookieCache: true });
  if (session.user.role !== "admin") throw HttpError.forbidden();
  return session;
}
