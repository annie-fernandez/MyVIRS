import type { Metadata } from "next";
import { AnalyzeView } from "@/components/analysis/analyze-view";

export const metadata: Metadata = { title: "Analyze a PDF" };

export default function AnalyzePage() {
  return <AnalyzeView source="pdf" />;
}
