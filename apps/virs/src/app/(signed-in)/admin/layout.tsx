import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/lib/auth/get-server-session";

/** Non-admins get a 404, so the admin area isn't advertised. The admin API routes check the role again. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (session?.user.role !== "admin") notFound();
  return children;
}
