import { USER_LEVELS } from "@repo/core";
import { z } from "zod";
import { badRequest, HttpError, notFound, parseJson, route } from "@/lib/api/http";
import { getAuth } from "@/lib/auth";
import { authErrorCode, findUserByUsername, requireOwnSession } from "@/lib/legacy/auth";
import { decryptLegacyPassword, toLegacyUser } from "@/lib/legacy/format";

type Context = RouteContext<"/api/user/[userName]">;

/**
 * Legacy UI: GET /api/user/:userName. Registration uses it to check whether a name is taken
 * (404 = available). Only the signed-in owner gets the full profile; nobody gets a password.
 */
export const GET = route(async (request, context: Context) => {
  const { userName } = await context.params;
  const match = await findUserByUsername(userName);
  if (!match) throw notFound("User not found.");

  const session = await getAuth().api.getSession({ headers: request.headers });
  if (session?.user.id !== match.id) return Response.json({ userName: match.displayUsername ?? match.username });
  return Response.json(toLegacyUser(match));
});

const legacyUpdate = z.object({
  updatePassword: z.boolean().optional(),
  password: z.string().optional(),
  newPassword: z.string().optional(),
  fullName: z.string().optional(),
  userName: z.string().optional(),
  email: z.string().optional(),
  userLevel: z.string().nullish(),
});

/**
 * Legacy UI: PATCH /api/user/:userName — profile update, or password change when
 * `updatePassword` is true. Status codes match what the Angular screens expect.
 */
export const PATCH = route(async (request, context: Context) => {
  const { userName } = await context.params;
  const session = await requireOwnSession(request, userName);
  const body = await parseJson(request, legacyUpdate);
  const auth = getAuth();

  try {
    if (body.updatePassword) {
      const currentPassword = decryptLegacyPassword(body.password);
      const newPassword = decryptLegacyPassword(body.newPassword);
      if (!currentPassword || !newPassword) throw badRequest("Both passwords are required.");
      await auth.api.changePassword({ body: { currentPassword, newPassword }, headers: request.headers });
      return Response.json(toLegacyUser(session.user));
    }

    const name = body.fullName?.trim();
    const email = body.email?.trim();
    const username = body.userName?.trim();
    if (!name || !email || !username || !z.email().safeParse(email).success) throw badRequest("Invalid profile.");
    const userLevel = (USER_LEVELS as readonly string[]).includes(body.userLevel ?? "") ? body.userLevel! : "";

    if (email.toLowerCase() !== session.user.email.toLowerCase()) {
      await auth.api.changeEmail({ body: { newEmail: email }, headers: request.headers });
    }
    await auth.api.updateUser({ body: { name, username, userLevel }, headers: request.headers });
    return Response.json(toLegacyUser({ ...session.user, name, email, username, displayUsername: username, userLevel }));
  } catch (error) {
    const code = authErrorCode(error);
    if (code === "INVALID_PASSWORD") throw new HttpError(401, "invalid_password", "Current password is incorrect.");
    if (code === "USERNAME_IS_ALREADY_TAKEN" || code?.startsWith("USER_ALREADY_EXISTS")) {
      throw new HttpError(403, "taken", "That user name or email is already in use.");
    }
    if (code) throw badRequest(code);
    throw error;
  }
});
