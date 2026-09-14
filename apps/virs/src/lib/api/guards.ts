import "server-only";
import { getAuth } from "../auth";
import { forbidden, unauthorized } from "./http";

export async function requireSession(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw unauthorized();
  return session;
}

export async function requireAdmin(request: Request) {
  const session = await requireSession(request);
  if (session.user.role !== "admin") throw forbidden();
  return session;
}
