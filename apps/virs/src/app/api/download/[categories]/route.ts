import { parseWordCategory, type WordCategory } from "@repo/core";
import { getDb } from "@repo/db";
import { listWordsByCategories } from "@repo/db/queries/words";
import Papa from "papaparse";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { csvResponse } from "@/app/api/_lib/http/csv-response";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { toLegacyCategory } from "@/app/api/_lib/legacy/to-legacy-category";

/**
 * Legacy UI: GET /api/download/:categories, e.g. "K1" or "K1, K2, K3".
 * The old API did not trim the spaces, so group downloads only ever returned the first list.
 */
export const GET = apiRoute(async (_request, context: RouteContext<"/api/download/[categories]">) => {
  const { categories } = await context.params;
  const parsed = [
    ...new Set(
      categories
        .split(",")
        .map((category) => parseWordCategory(category))
        .filter((category): category is WordCategory => category !== undefined),
    ),
  ];
  if (parsed.length === 0) throw HttpError.badRequest("Unknown category.");

  const words = await listWordsByCategories(getDb(), parsed);
  const csv = Papa.unparse({
    fields: ["Word", "Category"],
    data: words.map((word) => [word.value, toLegacyCategory(word.category)]),
  });
  return csvResponse(csv, `${parsed.map(toLegacyCategory).join("-")}.csv`);
});
