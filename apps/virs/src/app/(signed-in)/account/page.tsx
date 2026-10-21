import type { Metadata } from "next";
import { AccountScreen } from "./_components/account-screen";

export const metadata: Metadata = { title: "My profile" };

export default function Page() {
  return <AccountScreen />;
}
