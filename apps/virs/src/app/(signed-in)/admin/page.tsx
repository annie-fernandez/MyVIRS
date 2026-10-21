import type { Metadata } from "next";
import { AdminScreen } from "./_components/admin-screen";

export const metadata: Metadata = { title: "Manage the word lists", robots: { index: false } };

export default function Page() {
  return <AdminScreen />;
}
