import type { Metadata } from "next";
import { ChangePasswordScreen } from "./_components/change-password-screen";

export const metadata: Metadata = { title: "Change your password" };

export default function Page() {
  return <ChangePasswordScreen />;
}
