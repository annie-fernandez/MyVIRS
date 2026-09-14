import { contactInput } from "@repo/core";
import { parseJson, route } from "@/lib/api/http";
import { escapeHtml, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const POST = route(async (request) => {
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
