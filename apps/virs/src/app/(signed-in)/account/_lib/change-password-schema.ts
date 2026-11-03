import { z } from "zod";
import { passwordSchema } from "@/lib/account-schemas/password-schema";
import { refinePasswordsMatch } from "@/lib/account-schemas/refine-passwords-match";

export const changePasswordSchema = refinePasswordsMatch(
  z.object({ currentPassword: z.string().min(1, "Enter your current password."), password: passwordSchema, confirmPassword: z.string() }),
);
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
