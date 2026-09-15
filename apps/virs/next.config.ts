import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// `neon link`/`neon deploy` write the Neon connection strings to the repo-root .env.local.
// Load it after Next has read apps/virs/.env*, without overriding anything already set.
// Next is always started from apps/virs (pnpm --filter / turbo), so cwd is the app folder.
const rootEnvFile = path.resolve(process.cwd(), "../../.env.local");
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/core", "@repo/db"],
  // Node-only parsers that should not be bundled into server chunks.
  serverExternalPackages: ["word-extractor"],
  typedRoutes: true,
  async rewrites() {
    return {
      // The original Angular UI calls these with Spring-style paging params; route them to the
      // compatibility handler instead of the new /api/words endpoints.
      beforeFiles: [
        { source: "/api/words", has: [{ type: "query", key: "sortDirection" }], destination: "/api/legacy/words" },
        { source: "/api/words/valueandcat", destination: "/api/legacy/words" },
      ],
      afterFiles: [],
      // The Angular UI (built into /public) is a single-page app: every non-API URL loads it.
      fallback: [{ source: "/:path((?!api/|_next/).*)", destination: "/index.html" }],
    };
  },
};

export default nextConfig;
