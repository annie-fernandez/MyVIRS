import { forgotPasswordInput } from "@repo/core";
import { getDb, user } from "@repo/db";
import { eq } from "drizzle-orm";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { getAuth } from "@/lib/auth/get-auth";

/**
 * POST /api/account/forgot-password { identifier } — accepts a username or an email (the legacy
 * app supported both). Always responds 202 so the endpoint cannot be used to discover accounts.
 */
export const POST = apiRoute(async (request) => {
  const { identifier } = await parseJson(request, forgotPasswordInput);

  let email: string | undefined = identifier.includes("@") ? identifier.toLowerCase() : undefined;
  if (!email) {
    const [match] = await getDb()
      .select({ email: user.email })
      .from(user)
      .where(eq(user.username, identifier.toLowerCase()))
      .limit(1);
    email = match?.email;
  }

  if (email) {
    await getAuth().api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
      headers: request.headers,
    });
  }
  return new Response(null, { status: 202 });
});
