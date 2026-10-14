import type { Metadata } from "next";
import { HistoryScreen } from "@/components/history/history-screen";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "History" };

// Signed-out visitors aren't redirected: the screen tells them history needs an account.
export default async function Page() {
  const session = await getServerSession();
  return <HistoryScreen signedIn={session !== null} />;
}
