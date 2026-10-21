import "server-only";
import { getAuth } from "@/lib/auth/get-auth";

/** Sends a reset link that lands on the legacy /restore page (?token=…). */
export async function sendPasswordReset(request: Request, email: string | undefined) {
  if (!email) return;
  await getAuth().api.requestPasswordReset({
    body: { email, redirectTo: "/restore" },
    headers: request.headers,
  });
}
