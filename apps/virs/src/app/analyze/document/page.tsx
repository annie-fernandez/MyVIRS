import type { Metadata } from "next";
import { AnalyzeView } from "@/components/analysis/analyze-view";

export const metadata: Metadata = { title: "Analyze a Word document" };

export default function AnalyzePage() {
  return <AnalyzeView source="document" />;
}
