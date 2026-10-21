"use client";

import { use } from "react";
import { SessionContext } from "./session-context";
import type { SessionUser } from "./session-user";

/** The signed-in user, for screens in app/(signed-in), whose layout has already made sure there is one. */
export function useRequiredUser(): SessionUser {
  const user = use(SessionContext);
  if (!user) throw new Error("useRequiredUser must be used inside app/(signed-in)");
  return user;
}
