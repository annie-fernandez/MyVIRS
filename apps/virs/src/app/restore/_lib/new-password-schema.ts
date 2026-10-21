import { z } from "zod";
import { passwordSchema } from "@/lib/account-schemas/password-schema";
import { refinePasswordsMatch } from "@/lib/account-schemas/refine-passwords-match";

export const newPasswordSchema = refinePasswordsMatch(z.object({ password: passwordSchema, confirmPassword: z.string() }));
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
