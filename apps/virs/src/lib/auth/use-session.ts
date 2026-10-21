"use client";

import { use } from "react";
import { SessionContext } from "./session-context";
import type { SessionUser } from "./session-user";

/** The signed-in user, or null. Only for UI that differs for signed-in users; pages that need an account live in app/(signed-in). */
export function useSession(): SessionUser | null {
  return use(SessionContext);
}
