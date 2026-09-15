import { parseGrade, parseWordCategory, type WordSearchQuery } from "@repo/core";
import { getDb } from "@repo/db";
import { searchWords } from "@repo/db/queries/words";
import { badRequest, route } from "@/lib/api/http";
import { toLegacyPage } from "@/lib/legacy/format";

/**
 * Legacy UI word lists. next.config.ts rewrites these here:
 *   GET /api/words?category=k1&grade=K&page=0&size=20&sortKey=value&sortDirection=ASC
 *   GET /api/words/valueandcat?value=ab&category=k1&grade=K&page=0&size=20&sortDirection=ASC
 */
export const GET = route(async (request) => {
  const params = request.nextUrl.searchParams;
  const category = parseWordCategory(params.get("category") ?? "");
  if (!category) throw badRequest("Unknown category.");

  const size = Math.min(10_000, Math.max(1, Number(params.get("size")) || 20));
  const query: WordSearchQuery = {
    category,
    grade: parseGrade(params.get("grade") ?? ""),
    q: params.get("value")?.trim() || undefined,
    page: Math.max(0, Number(params.get("page")) || 0) + 1,
    pageSize: size,
    sort: params.get("sortDirection")?.toUpperCase() === "DESC" ? "desc" : "asc",
  };
  return Response.json(toLegacyPage(await searchWords(getDb(), query)));
});
