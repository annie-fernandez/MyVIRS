import { lookupDefinition } from "@/app/api/_lib/dictionary/lookup-definition";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";

export const GET = apiRoute(async (_request, context: RouteContext<"/api/dictionary/[word]">) => {
  const { word } = await context.params;
  if (word.length > 100) throw HttpError.notFound("No definition found.");

  const entry = await lookupDefinition(word).catch((error: unknown) => {
    console.error("[dictionary] lookup failed", error);
    throw new HttpError(503, "dictionary_unavailable", "The dictionary is unavailable right now.");
  });
  if (!entry) throw HttpError.notFound(`No definition found for "${word}".`);

  return Response.json(entry, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
});

