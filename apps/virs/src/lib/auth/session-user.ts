import type { UserLevel } from "@repo/core";

/** What the browser is told about the signed-in user. Never the session or its token. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** As the user typed it (displayUsername), falling back to the stored lower-case username. */
  username: string;
  userLevel: UserLevel | null;
  role: string | null;
  createdAt: string;
}
