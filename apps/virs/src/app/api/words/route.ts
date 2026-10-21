import { wordSearchQuery } from "@repo/core";
import { getDb } from "@repo/db";
import { searchWords } from "@repo/db/queries/words";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseSearchParams } from "@/app/api/_lib/http/parse-search-params";

/** GET /api/words?category=k1&grade=G3&q=ab&page=1&pageSize=20&sort=asc */
export const GET = apiRoute(async (request) => {
  const query = parseSearchParams(request, wordSearchQuery);
  return Response.json(await searchWords(getDb(), query));
});
