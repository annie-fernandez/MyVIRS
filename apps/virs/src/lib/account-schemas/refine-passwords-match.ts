import type { z } from "zod";

/** Adds "the two passwords don't match" to a form that asks for a new password twice. */
export function refinePasswordsMatch<T extends z.ZodType<{ password: string; confirmPassword: string }>>(schema: T) {
  return schema.refine((values) => values.password === values.confirmPassword, { path: ["confirmPassword"], message: "The two passwords don't match." });
}
