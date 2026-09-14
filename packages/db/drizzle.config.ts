import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load env files itself. packages/db/.env wins over the repo-root
// .env.local that `neon link`/`neon deploy` maintain; neither overrides real env vars.
for (const file of [".env", "../../.env.local"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Run `neon link` or copy packages/db/.env.example to packages/db/.env.");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a direct (non-pooled) Neon connection.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
