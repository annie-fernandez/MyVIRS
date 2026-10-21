import "server-only";
import { APIError } from "better-auth";

/** The Better Auth error code of a failed auth call, e.g. "USERNAME_IS_ALREADY_TAKEN". */
export function authErrorCode(error: unknown): string | undefined {
  if (!(error instanceof APIError)) return undefined;
  const body = error.body as { code?: string } | undefined;
  return body?.code;
}
