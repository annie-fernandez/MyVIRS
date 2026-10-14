import type { Metadata } from "next";
import { AnalyzeScreen } from "@/components/analysis/analyze-screen";

export const metadata: Metadata = { title: "Analyze a Word document" };

export default function Page() {
  return <AnalyzeScreen source="doc" />;
}
