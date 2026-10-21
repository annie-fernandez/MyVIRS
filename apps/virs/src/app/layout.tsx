import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dropzone/styles.css";

import { mantineHtmlProps } from "@mantine/core";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { unstable_rethrow } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-server-session";
import { toSessionUser } from "@/lib/auth/to-session-user";
import { SiteShell } from "./_components/site-shell/site-shell";
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
export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read once here so every screen knows who's signed in from the first paint. A failure must not
  // take down public pages, so it reads as signed out; app/(signed-in)/layout.tsx checks again and
  // fails loudly on pages that need an account.
  const session = await getServerSession().catch((error: unknown) => {
    // Next signals "this page is dynamic" by throwing from headers(); that must reach Next, not this catch.
    unstable_rethrow(error);
    console.error("[session] could not read the session", error);
    return null;
  });
  const user = session ? toSessionUser(session.user) : null;

  return (
    <html lang="en" className={lexend.variable} {...mantineHtmlProps}>
      <body>
        <Providers user={user}>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
