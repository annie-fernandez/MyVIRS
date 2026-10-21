import { translateInput } from "@repo/core";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { translate } from "@/app/api/translate/_lib/translate";

export const POST = apiRoute(async (request) => {
  const input = await parseJson(request, translateInput);
  return Response.json(await translate(input));
});
