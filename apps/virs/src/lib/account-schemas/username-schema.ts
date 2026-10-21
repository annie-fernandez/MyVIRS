import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(64, "Use 64 characters or fewer.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Use only letters, numbers, dots, dashes or underscores.");
