import "server-only";
import { sendEmail } from "@/lib/email/send-email";
import { env } from "@/lib/env/env";
import { formatErrorReport } from "./format-error-report";

/** Emails the operator a report of a server error. Never throws: a failed report is only logged. */
export async function reportServerError(error: unknown, where: { method: string; path: string }): Promise<void> {
  try {
    await sendEmail({ to: env().CONTACT_EMAIL_TO, ...formatErrorReport(error, where) });
  } catch (reportError) {
    console.error("[email] error report failed to send", reportError);
  }
}
