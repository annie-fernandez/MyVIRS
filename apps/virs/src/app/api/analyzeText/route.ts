import { analyzeTextInput } from "@repo/core";
import { analyze } from "@/app/api/_lib/analysis/analyze";
import { saveToHistory } from "@/app/api/_lib/analysis/save-to-history";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { toLegacyText } from "@/app/api/_lib/legacy/to-legacy-text";

/** Legacy UI: POST /api/analyzeText with the raw text as the request body. */
export const POST = apiRoute(async (request) => {
  const { text } = analyzeTextInput.parse({ text: await request.text() });
  const result = await analyze(text);
  // Analyses run from the Angular screens go into the same history as the Mantine ones.
  await saveToHistory(request, { sourceKind: "text", inputText: text, result });
  return Response.json(toLegacyText(result));
});
