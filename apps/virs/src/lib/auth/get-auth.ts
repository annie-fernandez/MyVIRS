import "server-only";
import { createAuth } from "./create-auth";

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

/** The Better Auth server, created on first use so builds don't need its environment variables. */
export function getAuth(): Auth {
  instance ??= createAuth();
  return instance;
}
