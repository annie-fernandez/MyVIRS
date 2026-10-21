import type { Metadata } from "next";
import { ResultsScreen } from "../_components/results-screen/results-screen";

export const metadata: Metadata = { title: "Text statistics" };

export default function Page() {
  return <ResultsScreen view="statistics" />;
}
