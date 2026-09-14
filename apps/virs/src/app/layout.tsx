import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Vocabulary in Reading Study", template: "%s · VIRS" },
  description:
    "Measure readability and see which words in a text are high-frequency, academic, STEM or rare — one word at a time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
