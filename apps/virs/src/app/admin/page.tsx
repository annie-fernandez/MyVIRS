import type { Metadata } from "next";
import { AdminScreen } from "@/components/admin/admin-screen";
import { requirePageAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Manage the word lists", robots: { index: false } };

export default async function Page() {
  await requirePageAdmin("/admin");
  return <AdminScreen />;
}
