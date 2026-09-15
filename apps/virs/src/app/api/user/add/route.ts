import { USER_LEVELS } from "@repo/core";
import { z } from "zod";
import { badRequest, HttpError, parseJson, route } from "@/lib/api/http";
import { getAuth } from "@/lib/auth";
import { authErrorCode } from "@/lib/legacy/auth";
import { decryptLegacyPassword, toLegacyUser } from "@/lib/legacy/format";

const legacyRegistration = z.object({
  fullName: z.string().trim().min(1),
  userName: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(1),
  userLevel: z.enum(USER_LEVELS).nullish(),
});

/** Legacy UI registration: POST /api/user/add. 403 = email already registered (shown by the UI). */
export const POST = route(async (request) => {
  const body = await parseJson(request, legacyRegistration);
  const password = decryptLegacyPassword(body.password);
  if (!password) throw badRequest("Invalid password.");

  try {
    const result = await getAuth().api.signUpEmail({
      body: {
        name: body.fullName,
        username: body.userName,
        email: body.email,
        password,
        userLevel: body.userLevel ?? undefined,
      },
    });
    return Response.json(toLegacyUser(result.user as Parameters<typeof toLegacyUser>[0]), { status: 201 });
  } catch (error) {
    const code = authErrorCode(error);
    if (code?.startsWith("USER_ALREADY_EXISTS")) throw new HttpError(403, "email_exists", "Email already registered.");
    if (code === "USERNAME_IS_ALREADY_TAKEN") throw new HttpError(403, "username_taken", "User name taken.");
    if (code) throw badRequest(code);
    throw error;
  }
});
