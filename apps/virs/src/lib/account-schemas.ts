import { MIN_PASSWORD_LENGTH, USER_LEVELS } from "@repo/core";
import { z } from "zod";

export const USER_LEVEL_SELECT_DATA = [...USER_LEVELS];

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(64, "Use 64 characters or fewer.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Use only letters, numbers, dots, dashes or underscores.");

const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(128, "Use 128 characters or fewer.");

export const profileSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(1, "Enter your name.").max(256),
  email: z.email("Enter a full email address, like ana@example.com."),
  userLevel: z.enum(USER_LEVELS).nullable(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

const matching = <T extends { password: string; confirmPassword: string }>(values: T) => values.password === values.confirmPassword;
const mismatch = { path: ["confirmPassword"], message: "The two passwords don't match." };

// No "confirm password" on sign-up: the field has a show-password toggle, and a forgotten password
// can be reset by email. Changing a password still asks twice.
export const signUpSchema = profileSchema.extend({ password: passwordSchema });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const newPasswordSchema = z.object({ password: passwordSchema, confirmPassword: z.string() }).refine(matching, mismatch);
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password."), password: passwordSchema, confirmPassword: z.string() })
  .refine(matching, mismatch);
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
