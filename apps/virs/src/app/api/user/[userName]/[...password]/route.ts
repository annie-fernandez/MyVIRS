import { HttpError, route } from "@/lib/api/http";
import { getAuth } from "@/lib/auth";
import { authErrorCode, requireOwnSession } from "@/lib/legacy/auth";
import { decryptLegacyPassword } from "@/lib/legacy/format";

/**
 * Legacy UI account deletion: DELETE /api/user/:userName/:encryptedPassword.
 * Catch-all because the base64 ciphertext can contain "/".
 */
export const DELETE = route(async (request, context: RouteContext<"/api/user/[userName]/[...password]">) => {
  const { userName, password: segments } = await context.params;
  await requireOwnSession(request, userName);

  const password = decryptLegacyPassword(segments.join("/"));
  if (!password) throw new HttpError(401, "invalid_password", "Password is incorrect.");

  try {
    await getAuth().api.deleteUser({ body: { password }, headers: request.headers });
  } catch (error) {
    if (authErrorCode(error) === "INVALID_PASSWORD") {
      throw new HttpError(401, "invalid_password", "Password is incorrect.");
    }
    throw error;
  }
  // JSON body: the Angular HTTP client treats empty 2xx bodies as errors.
  return Response.json({ deleted: true });
});
