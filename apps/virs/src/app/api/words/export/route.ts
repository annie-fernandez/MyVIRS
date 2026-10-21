import { wordExportQuery } from "@repo/core";
import { getDb } from "@repo/db";
import { listWordsByCategories } from "@repo/db/queries/words";
import { categoriesFilename } from "@/app/api/_lib/csv/categories-filename";
import { wordsToCsv } from "@/app/api/_lib/csv/words-to-csv";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { csvResponse } from "@/app/api/_lib/http/csv-response";
import { parseSearchParams } from "@/app/api/_lib/http/parse-search-params";

/** GET /api/words/export?categories=k1,k2,awl — CSV download. */
export const GET = apiRoute(async (request) => {
  const { categories } = parseSearchParams(request, wordExportQuery);
  const unique = [...new Set(categories)];
  const words = await listWordsByCategories(getDb(), unique);
  return csvResponse(wordsToCsv(words), categoriesFilename(unique));
});
