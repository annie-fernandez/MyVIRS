import { contextPassageInput, type ContextPassageMatch } from "@repo/core";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { loadContextList } from "../../_lib/load-context-list";
import { matchPassage } from "../../_lib/match-passage";

/**
 * POST /api/context-lists/:id/passage { counts: { cells: 3, … } } — a passage's words looked up in a
 * ranked list. The ranks are the whole book's, not the passage's: Team A's pipeline isn't run on it.
 */
export const POST = apiRoute(async (request, context: RouteContext<"/api/context-lists/[id]/passage">) => {
  const { counts } = await parseJson(request, contextPassageInput);
  const loaded = await loadContextList((await context.params).id);
  if (!loaded) throw HttpError.notFound("There's no ranked list with that name.");

  const body: ContextPassageMatch = { list: loaded.list, ...matchPassage(loaded.ranking, counts) };
  return Response.json(body);
});
