import type { Metadata } from "next";
import { AnalyzeScreen } from "../_components/analyze-screen/analyze-screen";

export const metadata: Metadata = { title: "Analyze your text" };

export default function Page() {
  return <AnalyzeScreen source="text" />;
}
