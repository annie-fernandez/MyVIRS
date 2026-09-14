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

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
