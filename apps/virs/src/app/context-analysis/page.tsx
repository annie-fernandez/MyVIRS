import type { Metadata } from "next";
import { Suspense } from "react";
import { ContextAnalysisScreen } from "./_components/context-analysis-screen";

export const metadata: Metadata = { title: "Analysis by context" };

// The screen keeps its filters in the URL, which needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <ContextAnalysisScreen />
    </Suspense>
  );
}
