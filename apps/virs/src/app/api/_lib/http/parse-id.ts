import { HttpError } from "./http-error";

/** A positive integer id from a route segment. */
export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) throw HttpError.badRequest("Invalid id.");
  return id;
}
