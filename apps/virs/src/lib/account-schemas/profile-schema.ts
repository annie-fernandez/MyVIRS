import { USER_LEVELS } from "@repo/core";
import { z } from "zod";
import { usernameSchema } from "./username-schema";

export const profileSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(1, "Enter your name.").max(256),
  email: z.email("Enter a full email address, like ana@example.com."),
  userLevel: z.enum(USER_LEVELS).nullable(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
