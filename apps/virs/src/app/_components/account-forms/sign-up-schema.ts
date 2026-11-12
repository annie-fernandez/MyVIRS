import type { z } from "zod";
import { passwordSchema } from "@/lib/account-schemas/password-schema";
import { profileSchema } from "@/lib/account-schemas/profile-schema";

// No "confirm password" on sign-up: the field has a show-password toggle, and a forgotten password
// can be reset by email. Changing a password still asks twice. The preferred language waits for My
// profile, to keep this form short.
export const signUpSchema = profileSchema.omit({ preferredLanguage: true }).extend({ password: passwordSchema });
export type SignUpValues = z.infer<typeof signUpSchema>;
