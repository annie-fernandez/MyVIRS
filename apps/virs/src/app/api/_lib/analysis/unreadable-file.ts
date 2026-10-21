import { HttpError } from "../http/http-error";

/** A 422 for an upload of the right kind that can't be read. */
export function unreadableFile(message: string): HttpError {
  return new HttpError(422, "unreadable_file", message);
}
