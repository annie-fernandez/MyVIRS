import { adminWordInput } from "@repo/core";
import { getDb } from "@repo/db";
import { deleteWord, updateWord } from "@repo/db/queries/words";
import { requireAdmin } from "@/lib/api/guards";
import { HttpError, notFound, parseId, parseJson, route } from "@/lib/api/http";

type Context = RouteContext<"/api/admin/words/[id]">;

function isUniqueViolation(error: unknown): boolean {
  const cause = error instanceof Error ? (error.cause ?? error) : error;
  return typeof cause === "object" && cause !== null && "code" in cause && cause.code === "23505";
}

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
  const id = parseId((await context.params).id);
  if (!(await deleteWord(getDb(), id))) throw notFound("Word not found.");
  return new Response(null, { status: 204 });
});
