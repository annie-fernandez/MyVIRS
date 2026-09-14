import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return <ContactForm />;
}
