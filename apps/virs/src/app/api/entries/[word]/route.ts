import { lookupDefinition } from "@/app/api/_lib/dictionary/lookup-definition";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";

/** Legacy UI: GET /api/entries/:word?source=WIKI → { wiki: { html } }. */
export const GET = apiRoute(async (_request, context: RouteContext<"/api/entries/[word]">) => {
  const { word } = await context.params;
  const entry = await lookupDefinition(word).catch((error: unknown) => {
    console.error("[dictionary] lookup failed", error);
    throw new HttpError(503, "dictionary_unavailable", "The dictionary is unavailable right now.");
  });
  if (!entry) throw HttpError.notFound(`No definition found for "${word}".`);
  return Response.json({ wiki: { html: entry.html } });
});
