import { getDb } from "@repo/db";
import { listAllWords } from "@repo/db/queries/words";
import { requireAdmin } from "@/app/api/_lib/auth/require-admin";
import { wordsToCsv } from "@/app/api/_lib/csv/words-to-csv";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { csvResponse } from "@/app/api/_lib/http/csv-response";

/** GET /api/admin/words/export — the full word database as CSV (re-importable). */
export const GET = apiRoute(async (request) => {
  await requireAdmin(request);
  return csvResponse(wordsToCsv(await listAllWords(getDb())), "virs-words.csv");
});
