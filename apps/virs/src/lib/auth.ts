import "server-only";
import { MIN_PASSWORD_LENGTH, USER_LEVELS } from "@repo/core";
import { account, getDb, session, user, verification } from "@repo/db";
import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { after } from "next/server";
import { escapeHtml, sendEmail } from "./email";
import { env } from "./env";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

function assertValidUserLevel(value: unknown) {
  if (value == null || value === "") return;
  if (!(USER_LEVELS as readonly unknown[]).includes(value)) {
    throw new APIError("BAD_REQUEST", { message: `userLevel must be one of: ${USER_LEVELS.join(", ")}` });
  }
}

function createAuth() {
  const { BETTER_AUTH_SECRET, BETTER_AUTH_URL } = env();

  return betterAuth({
    appName: "Vocabulary in Reading Study",
    secret: BETTER_AUTH_SECRET,
    baseURL: BETTER_AUTH_URL,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        // Sent after the response so response timing does not reveal whether the account exists.
        after(() =>
          sendEmail({
            to: user.email,
            subject: "Reset your VIRS password",
            text: `Hi ${user.name},\n\nReset your password here: ${url}\n\nIf you did not request this, ignore this email.`,
            html: `<p>Hi ${escapeHtml(user.name)},</p><p><a href="${url}">Reset your password</a>.</p><p>If you did not request this, ignore this email.</p>`,
          }),
        );
      },
    },
    user: {
      additionalFields: {
        userLevel: { type: "string", required: false, input: true },
      },
      changeEmail: { enabled: true, updateEmailWithoutVerification: true },
      deleteUser: { enabled: true },
    },
    databaseHooks: {
      user: {
        create: { before: async (data) => assertValidUserLevel(data.userLevel) },
        update: { before: async (data) => assertValidUserLevel(data.userLevel) },
      },
    },
    rateLimit: { enabled: true, storage: "memory" },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 64,
        usernameValidator: (value) => USERNAME_PATTERN.test(value),
      }),
      admin(),
      // Must stay last: lets server-side auth calls set cookies.
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

export function getAuth(): Auth {
  instance ??= createAuth();
  return instance;
}
