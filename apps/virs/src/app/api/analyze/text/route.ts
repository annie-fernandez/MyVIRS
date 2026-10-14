import { analyzeTextInput } from "@repo/core";
import { analyze } from "@/lib/analysis/analyze";
import { saveToHistory, type AnalyzeResponse } from "@/lib/analysis/history";
import { parseJson, route } from "@/lib/api/http";

export const POST = route(async (request) => {
  const { text, sourceKind } = await parseJson(request, analyzeTextInput);
  const result = await analyze(text);
  const historyId = await saveToHistory(request, { sourceKind, inputText: text, result });
  return Response.json({ ...result, historyId } satisfies AnalyzeResponse);
});
