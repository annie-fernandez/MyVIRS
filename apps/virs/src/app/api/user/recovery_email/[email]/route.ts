import { apiRoute } from "@/app/api/_lib/http/api-route";
import { emptyOk } from "@/app/api/_lib/legacy/empty-ok";
import { findUserByEmail } from "@/app/api/user/_lib/find-user-by-email";
import { sendPasswordReset } from "@/app/api/user/_lib/send-password-reset";

/** Legacy UI: GET /api/user/recovery_email/:email. Same response whether or not the email exists. */
export const GET = apiRoute(async (request, context: RouteContext<"/api/user/recovery_email/[email]">) => {
  const { email } = await context.params;
  await sendPasswordReset(request, (await findUserByEmail(email))?.email);
  return emptyOk();
});
