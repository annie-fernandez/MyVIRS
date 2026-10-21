import type { Metadata } from "next";
import { ResultsScreen } from "../_components/results-screen/results-screen";

export const metadata: Metadata = { title: "Enhanced text" };

export default function Page() {
  return <ResultsScreen view="enhanced" />;
}
