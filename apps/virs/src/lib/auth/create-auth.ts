import "server-only";
import { MIN_PASSWORD_LENGTH } from "@repo/core";
import { account, getDb, session, user, verification } from "@repo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { after } from "next/server";
import { escapeHtml } from "../email/escape-html";
import { sendEmail } from "../email/send-email";
import { env } from "../env/env";
import { assertValidUserLevel } from "./assert-valid-user-level";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

/** The Better Auth server. Use getAuth(), which creates it once, on first use. */
export function createAuth() {
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
        // Nothing can surface a failure to the caller from here, so log it loudly instead of
        // letting the rejection disappear — otherwise a missing RESEND_API_KEY looks like success.
        after(async () => {
          try {
            await sendEmail({
              to: user.email,
              subject: "Reset your VIRS password",
              text: `Hi ${user.name},\n\nReset your password here: ${url}\n\nIf you did not request this, ignore this email.`,
              html: `<p>Hi ${escapeHtml(user.name)},</p><p><a href="${url}">Reset your password</a>.</p><p>If you did not request this, ignore this email.</p>`,
            });
          } catch (error) {
            console.error("[auth] password reset email failed to send", error);
          }
        });
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
    session: {
      // Every page reads the session (app/layout.tsx), so it's kept in a signed cookie for 5 minutes
      // instead of a database query per page. A session revoked elsewhere can keep reading for up to
      // that long; requireAdmin always checks the database.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
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
