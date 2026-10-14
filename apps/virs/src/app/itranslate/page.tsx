import type { Metadata } from "next";
import { TranslateScreen } from "@/components/tools/translate-screen";

export const metadata: Metadata = { title: "iTranslate" };

export default function Page() {
  return <TranslateScreen />;
}
