import type { Metadata } from "next";
import { ContactScreen } from "@/components/info/contact-screen";

export const metadata: Metadata = { title: "Contact us" };

export default function Page() {
  return <ContactScreen />;
}
