import { adminWordInput, CATEGORY_INFO, normalizeWord } from "@repo/core";
import { getDb } from "@repo/db";
import { deleteWord, deleteWordsByValue, findWordsByValue, updateWord } from "@repo/db/queries/words";
import { requireAdmin } from "@/lib/api/guards";
import { HttpError, notFound, parseId, parseJson, route } from "@/lib/api/http";
import { isUniqueViolation } from "@/lib/db-errors";
import { toLegacyWord } from "@/lib/legacy/format";

type Context = RouteContext<"/api/admin/words/[id]">;

// This segment is a numeric id for the REST API and a word value for the legacy admin page
// (GET/DELETE /api/admin/words/:word). Word lists never contain purely numeric entries.
const isNumericId = (segment: string) => /^\d+$/.test(segment);

/** Legacy admin page: GET /api/admin/words/:word → the word's first entry. */
export const GET = route(async (request, context: Context) => {
  await requireAdmin(request);
  const { id: segment } = await context.params;
  const [match] = (await findWordsByValue(getDb(), normalizeWord(segment))).sort(
    (a, b) => CATEGORY_INFO[a.category].priority - CATEGORY_INFO[b.category].priority,
  );
  if (!match) throw notFound("Word not found.");
  return Response.json(toLegacyWord(match));
});

export const PATCH = route(async (request, context: Context) => {
  await requireAdmin(request);
  const id = parseId((await context.params).id);
  const input = await parseJson(request, adminWordInput);

  const word = await updateWord(getDb(), id, input).catch((error: unknown) => {
    if (isUniqueViolation(error)) {
      throw new HttpError(409, "conflict", `"${input.value}" already exists in ${input.category}.`);
    }
    throw error;
  });
  if (!word) throw notFound("Word not found.");
  return Response.json(word);
});

export const DELETE = route(async (request, context: Context) => {
  await requireAdmin(request);
  const { id: segment } = await context.params;

  if (!isNumericId(segment)) {
    const deleted = await deleteWordsByValue(getDb(), normalizeWord(segment));
    if (deleted === 0) throw notFound("Word not found.");
    // JSON body: the Angular HTTP client treats empty 2xx bodies as errors.
    return Response.json({ deleted });
  }

  if (!(await deleteWord(getDb(), parseId(segment)))) throw notFound("Word not found.");
  return new Response(null, { status: 204 });
});
