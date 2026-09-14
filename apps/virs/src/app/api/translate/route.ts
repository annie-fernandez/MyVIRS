import { translateInput } from "@repo/core";
import { parseJson, route } from "@/lib/api/http";
import { translate } from "@/lib/translate";

export const POST = route(async (request) => {
  const input = await parseJson(request, translateInput);
  return Response.json(await translate(input));
});
