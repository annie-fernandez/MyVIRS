import { MIN_PASSWORD_LENGTH } from "@repo/core";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(128, "Use 128 characters or fewer.");
