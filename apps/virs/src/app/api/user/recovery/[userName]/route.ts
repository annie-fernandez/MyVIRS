import { route } from "@/lib/api/http";
import { findUserByUsername, sendPasswordReset } from "@/lib/legacy/auth";
import { emptyOk } from "@/lib/legacy/format";

/**
 * Legacy UI: GET /api/user/recovery/:userName. Always answers the same way so it cannot be used
 * to discover accounts (the old API returned 404 for unknown users).
 */
export const GET = route(async (request, context: RouteContext<"/api/user/recovery/[userName]">) => {
  const { userName } = await context.params;
  await sendPasswordReset(request, (await findUserByUsername(userName))?.email);
  return emptyOk();
});
