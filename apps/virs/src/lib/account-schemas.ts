import { MIN_PASSWORD_LENGTH, USER_LEVELS } from "@repo/core";
import { z } from "zod";

export const USER_LEVEL_SELECT_DATA = [...USER_LEVELS];

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters")
  .max(64)
  .regex(/^[a-zA-Z0-9_.-]+$/, "Use letters, numbers, dots, dashes or underscores");

const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`).max(128);

export const profileSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(1, "Enter your name").max(256),
  email: z.email("Enter a valid email"),
  userLevel: z.enum(USER_LEVELS).nullable(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const signUpSchema = profileSchema
  .extend({ password: passwordSchema, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), password: passwordSchema, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
