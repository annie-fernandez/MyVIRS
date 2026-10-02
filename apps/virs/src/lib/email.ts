import "server-only";
import { Resend } from "resend";
import { env } from "./env";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

let client: Resend | undefined;

export async function sendEmail(message: EmailMessage): Promise<void> {
  const { RESEND_API_KEY, EMAIL_FROM, NODE_ENV } = env();

  if (!RESEND_API_KEY) {
    if (NODE_ENV === "production") throw new Error("RESEND_API_KEY is not configured");
    console.info(`[email:dev] to=${message.to} subject="${message.subject}"\n${message.text}`);
    return;
  }

  client ??= new Resend(RESEND_API_KEY);
  const { error } = await client.emails.send({ from: EMAIL_FROM, ...message });
  if (error) throw new Error(`Failed to send email: ${error.message}`);
}

/** The old site mailed vocabinreading@gmail.com a stack trace when the server crashed. */
export function formatErrorReport(error: unknown, where: { method: string; path: string }): Omit<EmailMessage, "to"> {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error && error.stack ? error.stack.slice(0, 4_000) : "";
  const text = `There was an application error\n${where.method} ${where.path}\n${name}: ${message}\n\n${stack}`;
  return {
    subject: "Vocabulary in Reading application error",
    text,
    html: `<h2>There was an application error</h2><p><strong>${escapeHtml(where.method)} ${escapeHtml(where.path)}</strong></p><p>${escapeHtml(name)}: ${escapeHtml(message)}</p><pre>${escapeHtml(stack)}</pre>`,
  };
}

export async function reportServerError(error: unknown, where: { method: string; path: string }): Promise<void> {
  try {
    await sendEmail({ to: env().CONTACT_EMAIL_TO, ...formatErrorReport(error, where) });
  } catch (reportError) {
    console.error("[email] error report failed to send", reportError);
  }
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
