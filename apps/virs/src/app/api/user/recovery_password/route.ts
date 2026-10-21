import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { decryptLegacyPassword } from "@/app/api/_lib/legacy/decrypt-legacy-password";
import { authErrorCode } from "@/app/api/user/_lib/auth-error-code";
import { getAuth } from "@/lib/auth/get-auth";

/**
 * Legacy /restore page: POST /api/user/recovery_password?token=…&password=… (also sent as a JSON
 * body). The token comes from the Better Auth reset link, which redirects to /restore?token=….
 */
export const POST = apiRoute(async (request) => {
  const body = (await request.json().catch(() => ({}))) as { token?: string; password?: string };
  const params = request.nextUrl.searchParams;
  const token = body.token ?? params.get("token") ?? "";
  // The UI builds the query string without encoding, so "+" in the ciphertext arrives as " ".
  const encrypted = body.password ?? params.get("password")?.replaceAll(" ", "+");
  const newPassword = decryptLegacyPassword(encrypted);
  if (!token || !newPassword) throw new HttpError(404, "invalid_token", "This reset link is invalid.");

  try {
    await getAuth().api.resetPassword({ body: { newPassword, token } });
  } catch (error) {
    const code = authErrorCode(error);
    if (code === "INVALID_TOKEN") throw new HttpError(404, "invalid_token", "This reset link is invalid or expired.");
    if (code) throw new HttpError(400, "bad_request", code);
    throw error;
  }
  return Response.json({ reset: true });
});
