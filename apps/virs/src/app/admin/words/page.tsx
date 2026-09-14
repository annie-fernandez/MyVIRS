import type { Metadata } from "next";
import { AdminWordsView } from "@/components/admin/admin-words-view";
import { requirePageAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Manage words", robots: { index: false } };

export default async function AdminWordsPage() {
  await requirePageAdmin("/admin/words");
  return <AdminWordsView />;
}
