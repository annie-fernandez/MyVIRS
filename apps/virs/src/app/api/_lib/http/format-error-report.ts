import { escapeHtml } from "@/lib/email/escape-html";
import type { EmailMessage } from "@/lib/email/send-email";

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
