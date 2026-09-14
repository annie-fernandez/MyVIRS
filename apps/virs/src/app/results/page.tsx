import type { Metadata } from "next";
import { ResultsView } from "@/components/analysis/results-view";

export const metadata: Metadata = { title: "Results" };

export default function ResultsPage() {
  return <ResultsView />;
}
