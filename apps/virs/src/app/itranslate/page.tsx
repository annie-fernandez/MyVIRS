import type { Metadata } from "next";
import { TranslateScreen } from "./_components/translate-screen";

export const metadata: Metadata = { title: "iTranslate" };

export default function Page() {
  return <TranslateScreen />;
}
