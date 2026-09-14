import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDb(connectionString: string) {
  return drizzle(neon(connectionString), { schema });
}

export type Database = ReturnType<typeof createDb>;

let cached: Database | undefined;

/** Lazily connects so importing this module never requires DATABASE_URL (e.g. during `next build`). */
export function getDb(): Database {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  cached = createDb(url);
  return cached;
}
