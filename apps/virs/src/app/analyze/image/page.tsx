import type { Metadata } from "next";
import { AnalyzeView } from "@/components/analysis/analyze-view";

export const metadata: Metadata = { title: "Analyze an image" };

export default function AnalyzePage() {
  return <AnalyzeView source="image" />;
}
