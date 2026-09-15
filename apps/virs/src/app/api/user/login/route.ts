import { z } from "zod";
import { HttpError, parseJson, route, unauthorized } from "@/lib/api/http";
import { getAuth } from "@/lib/auth";
import { decryptLegacyPassword, toLegacyUser, type LegacyUserSource } from "@/lib/legacy/format";

/**
 * Legacy UI sign-in: POST /api/user/login { userName, password (AES-encrypted by the UI) }.
 * Replaces the old flow that downloaded the stored password and compared it in the browser.
 * Sets the Better Auth session cookie and returns the user profile.
 */
export const POST = route(async (request) => {
  const body = await parseJson(request, z.object({ userName: z.string().trim().min(1), password: z.string().min(1) }));
  const password = decryptLegacyPassword(body.password);
  if (!password) throw unauthorized();

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
