"use client";

/**
 * Last resort when the root layout itself fails. It replaces the whole document, so the root layout,
 * MantineProvider, the theme and global CSS aren't available: plain HTML with inline styles is all
 * that's safe here (the hex values below are VIRS_TOKENS.text and VIRS_TOKENS.page).
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32, color: "#17191e", background: "#f1f2f5" }}>
        <title>Something went wrong · VIRS</title>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something went wrong</h1>
        <p>VIRS couldn&apos;t load. Try again in a moment.</p>
        <button type="button" onClick={() => retry()}>
          Try again
        </button>
      </body>
    </html>
  );
}
