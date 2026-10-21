import { FALLBACK_MESSAGE } from "./fallback-message";

/** A message a reader can act on, for any caught error. */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : FALLBACK_MESSAGE;
}
