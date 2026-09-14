import { HttpError, notFound, route } from "@/lib/api/http";
import { lookupDefinition } from "@/lib/dictionary";

export const GET = route(async (_request, context: RouteContext<"/api/dictionary/[word]">) => {
  const { word } = await context.params;
  if (word.length > 100) throw notFound("No definition found.");

  const entry = await lookupDefinition(word).catch((error: unknown) => {
    console.error("[dictionary] lookup failed", error);
    throw new HttpError(503, "dictionary_unavailable", "The dictionary is unavailable right now.");
  });
  if (!entry) throw notFound(`No definition found for "${word}".`);

  return Response.json(entry, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
});
