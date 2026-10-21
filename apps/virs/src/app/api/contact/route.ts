import { contactInput } from "@repo/core";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { escapeHtml } from "@/lib/email/escape-html";
import { sendEmail } from "@/lib/email/send-email";
import { env } from "@/lib/env/env";

export const POST = apiRoute(async (request) => {
  const { website, ...message } = await parseJson(request, contactInput);
  // Honeypot filled in: pretend success so bots get no signal.
  if (website) return new Response(null, { status: 204 });

  const name = `${message.firstName} ${message.lastName}`;
  await sendEmail({
    to: env().CONTACT_EMAIL_TO,
    replyTo: message.email,
    subject: `VIRS contact form: ${name}`,
    text: `From: ${name} <${message.email}>\nPhone: ${message.phone ?? "-"}\n\n${message.message}`,
    html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(message.email)}&gt;<br/><strong>Phone:</strong> ${escapeHtml(message.phone ?? "-")}</p><p>${escapeHtml(message.message).replaceAll("\n", "<br/>")}</p>`,
  });
  return new Response(null, { status: 204 });
});
