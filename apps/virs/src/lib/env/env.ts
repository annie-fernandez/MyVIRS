import "server-only";
import { z } from "zod";
import { EnvConfigError } from "./env-config-error";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().optional(),
  EMAIL_FROM: z.string().default("VIRS <do-not-reply@myvirs.com>"),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_EMAIL_TO: z.email().default("vocabinreading@gmail.com"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/** Validated lazily so `next build` works without runtime secrets. */
export function env(): ServerEnv {
  if (cached) return cached;
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new EnvConfigError(Object.keys(z.flattenError(result.error).fieldErrors));
  }
  cached = result.data;
  return cached;
}
