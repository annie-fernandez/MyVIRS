import type { Metadata } from "next";
import { ContextAnalysisScreen } from "./_components/context-analysis-screen";

export const metadata: Metadata = { title: "Analysis by context" };

export default function Page() {
  return <ContextAnalysisScreen />;
}
