export function isUniqueViolation(error: unknown): boolean {
  const cause = error instanceof Error ? (error.cause ?? error) : error;
  return typeof cause === "object" && cause !== null && "code" in cause && cause.code === "23505";
}
