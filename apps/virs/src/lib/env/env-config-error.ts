/** A server misconfiguration, never the caller's fault — must not surface as a 400. */
export class EnvConfigError extends Error {
  constructor(readonly variables: string[]) {
    super(`Invalid server configuration: ${variables.join(", ")}`);
    this.name = "EnvConfigError";
  }
}
