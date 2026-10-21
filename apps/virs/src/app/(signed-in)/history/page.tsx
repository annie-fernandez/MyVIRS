import type { Metadata } from "next";
import { HistoryScreen } from "./_components/history-screen";

export const metadata: Metadata = { title: "History" };

export default function Page() {
  return <HistoryScreen />;
}
