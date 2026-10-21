import { HttpError } from "../http/http-error";

/** A 415 for an upload that isn't the kind of file it claims to be. */
export function unsupportedFile(message: string): HttpError {
  return new HttpError(415, "unsupported_file", message);
}
