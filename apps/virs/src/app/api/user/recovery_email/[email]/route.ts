import { route } from "@/lib/api/http";
import { findUserByEmail, sendPasswordReset } from "@/lib/legacy/auth";
import { emptyOk } from "@/lib/legacy/format";

/** Legacy UI: GET /api/user/recovery_email/:email. Same response whether or not the email exists. */
export const GET = route(async (request, context: RouteContext<"/api/user/recovery_email/[email]">) => {
  const { email } = await context.params;
  await sendPasswordReset(request, (await findUserByEmail(email))?.email);
  return emptyOk();
});
