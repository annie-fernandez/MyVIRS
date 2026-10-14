import type { Metadata } from "next";
import { ReferencesScreen } from "@/components/info/references-screen";

export const metadata: Metadata = { title: "References" };

export default function Page() {
  return <ReferencesScreen />;
}
