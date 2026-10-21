/**
 * A failed Better Auth call as a real Error, so a TanStack mutation can throw it. Better Auth's client
 * returns `{ data, error }` instead of throwing; mutation functions turn that `error` into this.
 */
export class AuthError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string | undefined,
  ) {
    super(message ?? "Something went wrong. Please try again.");
  }

  static from(error: { status: number; code?: string; message?: string }): AuthError {
    return new AuthError(error.status, error.code, error.message);
  }
}
