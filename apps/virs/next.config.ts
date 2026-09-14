import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// `neon link`/`neon deploy` write the Neon connection strings to the repo-root .env.local.
// Load it after Next has read apps/virs/.env*, without overriding anything already set.
// Next is always started from apps/virs (pnpm --filter / turbo), so cwd is the app folder.
const rootEnvFile = path.resolve(process.cwd(), "../../.env.local");
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

// Old Angular routes, so bookmarks and links keep working.
const LEGACY_REDIRECTS: [string, string][] = [
  ["/dashboard", "/"],
  ["/text", "/analyze/text"],
  ["/doc", "/analyze/document"],
  ["/pdf", "/analyze/pdf"],
  ["/image", "/analyze/image"],
  ["/enhanced-text-result", "/results"],
  ["/text-statistics", "/results"],
  ["/search-words", "/words"],
  ["/download-words", "/words/download"],
  ["/itranslate", "/translate"],
  ["/contact-us", "/contact"],
  ["/credits", "/references"],
  ["/register", "/sign-up"],
  ["/change-password", "/account"],
  ["/restore", "/forgot-password"],
  ["/admin", "/admin/words"],
];

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/core", "@repo/db"],
  // Node-only parsers that should not be bundled into server chunks.
  serverExternalPackages: ["word-extractor"],
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@mantine/charts", "@tabler/icons-react"],
  },
  async redirects() {
    return LEGACY_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
