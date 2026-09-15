import { HttpError, notFound, route } from "@/lib/api/http";
import { lookupDefinition } from "@/lib/dictionary";

/** Legacy UI: GET /api/entries/:word?source=WIKI → { wiki: { html } }. */
export const GET = route(async (_request, context: RouteContext<"/api/entries/[word]">) => {
  const { word } = await context.params;
  const entry = await lookupDefinition(word).catch((error: unknown) => {
    console.error("[dictionary] lookup failed", error);
    throw new HttpError(503, "dictionary_unavailable", "The dictionary is unavailable right now.");
  });
  if (!entry) throw notFound(`No definition found for "${word}".`);
  return Response.json({ wiki: { html: entry.html } });
});
