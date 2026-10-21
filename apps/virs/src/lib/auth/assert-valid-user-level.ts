import { USER_LEVELS } from "@repo/core";
import { APIError } from "better-auth";

/** Rejects a user level that isn't one of USER_LEVELS. Empty means "not set". */
export function assertValidUserLevel(value: unknown) {
  if (value == null || value === "") return;
  if (!(USER_LEVELS as readonly unknown[]).includes(value)) {
    throw new APIError("BAD_REQUEST", { message: `userLevel must be one of: ${USER_LEVELS.join(", ")}` });
  }
}
