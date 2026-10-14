import type { Metadata } from "next";
import { AnalyzeScreen } from "@/components/analysis/analyze-screen";

export const metadata: Metadata = { title: "Analyze a PDF" };

export default function Page() {
  return <AnalyzeScreen source="pdf" />;
}
