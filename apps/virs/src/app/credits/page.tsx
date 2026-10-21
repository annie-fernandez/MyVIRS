import type { Metadata } from "next";
import { ReferencesScreen } from "./_components/references-screen";

export const metadata: Metadata = { title: "References" };

export default function Page() {
  return <ReferencesScreen />;
}
