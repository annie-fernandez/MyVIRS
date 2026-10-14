import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";

import { mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { Providers } from "./providers";

// Lexend was designed to make reading easier (wide letterforms, open spacing), which suits a
// vocabulary app. next/font self-hosts it, so visitors never contact Google.
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Vocabulary in Reading Study", template: "%s · VIRS" },
  description:
    "Measure readability and see which words in a text are high-frequency, academic, STEM or rare.",
};

// Only Mantine pages use this layout. Every other URL falls through to the Angular build in
// public/ (see the fallback rewrite in next.config.ts).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={lexend.variable} {...mantineHtmlProps}>
      <body>
        {/* Europa, kept for the site title: the same Adobe Fonts kit the Angular header loads. */}
        <link rel="stylesheet" href="https://use.typekit.net/wya3hqm.css" precedence="default" />
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
