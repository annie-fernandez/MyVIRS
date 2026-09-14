import type { Metadata } from "next";
import { AnalyzeView } from "@/components/analysis/analyze-view";

export const metadata: Metadata = { title: "Analyze text" };

export default function AnalyzePage() {
  return <AnalyzeView source="text" />;
}
