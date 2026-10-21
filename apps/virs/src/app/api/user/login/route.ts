import { z } from "zod";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { decryptLegacyPassword } from "@/app/api/_lib/legacy/decrypt-legacy-password";
import { toLegacyUser, type LegacyUserSource } from "@/app/api/_lib/legacy/to-legacy-user";
import { getAuth } from "@/lib/auth/get-auth";

/**
 * Legacy UI sign-in: POST /api/user/login { userName, password (AES-encrypted by the UI) }.
 * Replaces the old flow that downloaded the stored password and compared it in the browser.
 * Sets the Better Auth session cookie and returns the user profile.
 */
export const POST = apiRoute(async (request) => {
  const body = await parseJson(request, z.object({ userName: z.string().trim().min(1), password: z.string().min(1) }));
  const password = decryptLegacyPassword(body.password);
  if (!password) throw HttpError.unauthorized();

  const result = await getAuth().api.signInUsername({
    body: { username: body.userName, password },
    headers: request.headers,
    asResponse: true,
  });
  if (result.status === 429) throw new HttpError(429, "rate_limited", "Too many attempts. Try again in a minute.");
  if (!result.ok) throw new HttpError(401, "invalid_credentials", "Incorrect user name or password.");

  const { user } = (await result.json()) as { user: LegacyUserSource };
  const response = Response.json(toLegacyUser(user));
  for (const cookie of result.headers.getSetCookie()) response.headers.append("Set-Cookie", cookie);
  return response;
});
