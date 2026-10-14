import type { Metadata } from "next";
import { StyleGuide } from "./style-guide";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

/** Not linked from the site. A reference for the team building Mantine screens. */
export default function StyleGuidePage() {
  return <StyleGuide />;
}
