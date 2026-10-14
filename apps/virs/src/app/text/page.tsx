import type { Metadata } from "next";
import { AnalyzeScreen } from "@/components/analysis/analyze-screen";

export const metadata: Metadata = { title: "Analyze your text" };

export default function Page() {
  return <AnalyzeScreen source="text" />;
}
