import { apiRoute } from "@/app/api/_lib/http/api-route";
import { emptyOk } from "@/app/api/_lib/legacy/empty-ok";
import { findUserByUsername } from "@/app/api/user/_lib/find-user-by-username";
import { sendPasswordReset } from "@/app/api/user/_lib/send-password-reset";

/**
 * Legacy UI: GET /api/user/recovery/:userName. Always answers the same way so it cannot be used
 * to discover accounts (the old API returned 404 for unknown users).
 */
export const GET = apiRoute(async (request, context: RouteContext<"/api/user/recovery/[userName]">) => {
  const { userName } = await context.params;
  await sendPasswordReset(request, (await findUserByUsername(userName))?.email);
  return emptyOk();
});
