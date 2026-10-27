import type { Metadata } from "next";
import { ResultsScreen } from "../_components/results-screen/results-screen";

export const metadata: Metadata = { title: "Words by context" };

export default function Page() {
  return <ResultsScreen view="context" />;
}
