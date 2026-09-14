import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Better Auth serves sign-up, sign-in (email or username), sign-out, session, profile updates,
// password change/reset and account deletion under /api/auth/*.
export function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}
