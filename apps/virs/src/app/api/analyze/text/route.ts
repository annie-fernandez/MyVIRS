import { analyzeTextInput } from "@repo/core";
import { analyze } from "@/lib/analysis/analyze";
import { saveSignedInAnalysis } from "@/lib/analysis/record";
import { parseJson, route } from "@/lib/api/http";

export const POST = route(async (request) => {
  const { text } = await parseJson(request, analyzeTextInput);
  const result = await analyze(text);
  await saveSignedInAnalysis(request, { sourceKind: "text", inputText: text, result });
  return Response.json(result);
});
