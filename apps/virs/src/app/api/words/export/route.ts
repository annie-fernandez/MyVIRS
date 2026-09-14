import { wordExportQuery } from "@repo/core";
import { getDb } from "@repo/db";
import { listWordsByCategories } from "@repo/db/queries/words";
import { csvResponse, parseSearchParams, route } from "@/lib/api/http";
import { categoriesFilename, wordsToCsv } from "@/lib/csv";

/** GET /api/words/export?categories=k1,k2,awl — CSV download. */
export const GET = route(async (request) => {
  const { categories } = parseSearchParams(request, wordExportQuery);
  const unique = [...new Set(categories)];
  const words = await listWordsByCategories(getDb(), unique);
  return csvResponse(wordsToCsv(words), categoriesFilename(unique));
});
