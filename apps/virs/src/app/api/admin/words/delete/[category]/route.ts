import { wordCategorySchema } from "@repo/core";
import { getDb } from "@repo/db";
import { deleteWordsByCategory } from "@repo/db/queries/words";
import { requireAdmin } from "@/app/api/_lib/auth/require-admin";
import { apiRoute } from "@/app/api/_lib/http/api-route";

/** Legacy admin page: GET /api/admin/words/delete/:category removes every word in a list. */
export const GET = apiRoute(async (request, context: RouteContext<"/api/admin/words/delete/[category]">) => {
  await requireAdmin(request);
  const category = wordCategorySchema.parse((await context.params).category);
  return Response.json({ deleted: await deleteWordsByCategory(getDb(), category) });
});
