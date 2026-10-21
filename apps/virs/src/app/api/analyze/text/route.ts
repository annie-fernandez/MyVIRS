import { analyzeTextInput } from "@repo/core";
import { analyze } from "@/app/api/_lib/analysis/analyze";
import { saveToHistory, type AnalyzeResponse } from "@/app/api/_lib/analysis/save-to-history";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseJson } from "@/app/api/_lib/http/parse-json";

export const POST = apiRoute(async (request) => {
  const { text, sourceKind } = await parseJson(request, analyzeTextInput);
  const result = await analyze(text);
  const historyId = await saveToHistory(request, { sourceKind, inputText: text, result });
  return Response.json({ ...result, historyId } satisfies AnalyzeResponse);
});
