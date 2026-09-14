import { getDb } from "@repo/db";
import { listAllWords } from "@repo/db/queries/words";
import { requireAdmin } from "@/lib/api/guards";
import { csvResponse, route } from "@/lib/api/http";
import { wordsToCsv } from "@/lib/csv";

/** GET /api/admin/words/export — the full word database as CSV (re-importable). */
export const GET = route(async (request) => {
  await requireAdmin(request);
  return csvResponse(wordsToCsv(await listAllWords(getDb())), "virs-words.csv");
});
