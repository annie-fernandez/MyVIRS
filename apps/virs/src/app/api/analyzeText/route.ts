import { analyzeTextInput } from "@repo/core";
import { analyze } from "@/lib/analysis/analyze";
import { saveSignedInAnalysis } from "@/lib/analysis/record";
import { route } from "@/lib/api/http";
import { toLegacyText } from "@/lib/legacy/format";

/** Legacy UI: POST /api/analyzeText with the raw text as the request body. */
export const POST = route(async (request) => {
  const { text } = analyzeTextInput.parse({ text: await request.text() });
  const result = await analyze(text);
  await saveSignedInAnalysis(request, { sourceKind: "text", inputText: text, result });
  return Response.json(toLegacyText(result));
});
