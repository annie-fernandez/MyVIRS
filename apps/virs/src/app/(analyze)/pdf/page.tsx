import type { Metadata } from "next";
import { AnalyzeScreen } from "../_components/analyze-screen/analyze-screen";

export const metadata: Metadata = { title: "Analyze a PDF" };

export default function Page() {
  return <AnalyzeScreen source="pdf" />;
}
