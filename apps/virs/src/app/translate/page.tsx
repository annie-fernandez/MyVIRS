import type { Metadata } from "next";
import { TranslateView } from "@/components/translate/translate-view";

export const metadata: Metadata = { title: "Translate" };

export default function TranslatePage() {
  return <TranslateView />;
}
