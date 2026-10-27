import { contextListQuery, type ContextListPage } from "@repo/core";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { parseSearchParams } from "@/app/api/_lib/http/parse-search-params";
import { loadContextList } from "../_lib/load-context-list";
import { orderByFrequency } from "../_lib/order-by-frequency";

/** GET /api/context-lists/:id?by=context|frequency&q=cel&page=1&pageSize=50 — one page of a ranked list. */
export const GET = apiRoute(async (request, context: RouteContext<"/api/context-lists/[id]">) => {
  const { by, q, page, pageSize } = parseSearchParams(request, contextListQuery);
  const loaded = await loadContextList((await context.params).id);
  if (!loaded) throw HttpError.notFound("There's no ranked list with that name.");

  // Ranks are worked out over the whole list first, so a search shows each word's real place in it.
  const ordered = by === "frequency" ? orderByFrequency(loaded.ranking.words) : loaded.ranking.words;
  const matching = q ? ordered.filter((word) => word.forms.some((form) => form.startsWith(q)) || word.headword.startsWith(q)) : ordered;
  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  const body: ContextListPage = {
    list: loaded.list,
    words: { items: matching.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: matching.length, totalPages },
  };
  return Response.json(body);
});
