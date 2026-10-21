import type { Route } from "next";

/**
 * A `next` URL parameter, if it's a page on this site, else null. "//evil.com" and "/\evil.com"
 * are other sites to a browser, so they're refused: a link must never send someone off-site after
 * they log in.
 */
export function safeNextPath(next: string | null | undefined): Route | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next as Route;
}
