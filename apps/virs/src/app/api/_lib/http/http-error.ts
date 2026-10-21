/** An error a route handler throws to answer with that status and message (see apiRoute). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, "bad_request", message, details);
  }

  static unauthorized() {
    return new HttpError(401, "unauthorized", "Sign in to continue.");
  }

  static forbidden() {
    return new HttpError(403, "forbidden", "You do not have access to this resource.");
  }

  static notFound(message = "Not found.") {
    return new HttpError(404, "not_found", message);
  }
}
