import type { Metadata } from "next";
import { ChangePasswordScreen } from "@/components/account/change-password-screen";
import { requirePageSession } from "@/lib/session";

export const metadata: Metadata = { title: "Change your password" };

export default async function Page() {
  await requirePageSession("/change-password");
  return <ChangePasswordScreen />;
}
