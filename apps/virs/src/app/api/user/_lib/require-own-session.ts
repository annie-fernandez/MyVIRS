import "server-only";
import { getAuth } from "@/lib/auth/get-auth";
import { HttpError } from "../../_lib/http/http-error";

/** The legacy account endpoints are keyed by user name; only that user may use them. */
export async function requireOwnSession(request: Request, userName: string) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw HttpError.unauthorized();
  if (session.user.username?.toLowerCase() !== userName.trim().toLowerCase()) throw HttpError.forbidden();
  return session;
}
