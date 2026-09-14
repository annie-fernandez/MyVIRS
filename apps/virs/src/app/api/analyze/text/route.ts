import { analyzeTextInput } from "@repo/core";
import { analyze } from "@/lib/analysis/analyze";
import { parseJson, route } from "@/lib/api/http";

export const POST = route(async (request) => {
  const { text } = await parseJson(request, analyzeTextInput);
  return Response.json(await analyze(text));
});
