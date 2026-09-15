import { HttpError, route } from "@/lib/api/http";
import { getAuth } from "@/lib/auth";
import { authErrorCode } from "@/lib/legacy/auth";
import { decryptLegacyPassword } from "@/lib/legacy/format";

/**
 * Legacy /restore page: POST /api/user/recovery_password?token=…&password=… (also sent as a JSON
 * body). The token comes from the Better Auth reset link, which redirects to /restore?token=….
 */
export const POST = route(async (request) => {
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
