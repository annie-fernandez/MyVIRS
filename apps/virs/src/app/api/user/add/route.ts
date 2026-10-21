import { USER_LEVELS } from "@repo/core";
import { z } from "zod";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { decryptLegacyPassword } from "@/app/api/_lib/legacy/decrypt-legacy-password";
import { toLegacyUser } from "@/app/api/_lib/legacy/to-legacy-user";
import { authErrorCode } from "@/app/api/user/_lib/auth-error-code";
import { getAuth } from "@/lib/auth/get-auth";

const legacyRegistration = z.object({
  fullName: z.string().trim().min(1),
  userName: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(1),
  userLevel: z.enum(USER_LEVELS).nullish(),
});

/** Legacy UI registration: POST /api/user/add. 403 = email already registered (shown by the UI). */
export const POST = apiRoute(async (request) => {
  const body = await parseJson(request, legacyRegistration);
  const password = decryptLegacyPassword(body.password);
  if (!password) throw HttpError.badRequest("Invalid password.");

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
    if (code) throw HttpError.badRequest(code);
    throw error;
  }
});
