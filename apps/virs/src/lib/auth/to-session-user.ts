import "server-only";
import { USER_LEVELS, type UserLevel } from "@repo/core";
import type { getServerSession } from "./get-server-session";
import type { SessionUser } from "./session-user";

type ServerUser = NonNullable<Awaited<ReturnType<typeof getServerSession>>>["user"];

/** The signed-in user as the browser may see it. */
export function toSessionUser(user: ServerUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.displayUsername ?? user.username ?? "",
    // Stored as free text by older sign-ups; anything outside USER_LEVELS reads as "not set".
    userLevel: (USER_LEVELS as readonly string[]).includes(user.userLevel ?? "") ? (user.userLevel as UserLevel) : null,
    role: user.role ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
