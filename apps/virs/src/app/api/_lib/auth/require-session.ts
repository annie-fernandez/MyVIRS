import "server-only";
import { getAuth } from "@/lib/auth/get-auth";
import { HttpError } from "../http/http-error";

/** The signed-in user's session, or a 401. Pass disableCookieCache to check the database, not the cookie. */
export async function requireSession(request: Request, { disableCookieCache = false } = {}) {
  const session = await getAuth().api.getSession({ headers: request.headers, query: { disableCookieCache } });
  if (!session) throw HttpError.unauthorized();
  return session;
}
