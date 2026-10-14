import type { Metadata } from "next";
import { ResultsScreen } from "@/components/analysis/results-screen";

export const metadata: Metadata = { title: "Enhanced text" };

export default function Page() {
  return <ResultsScreen view="enhanced" />;
}
