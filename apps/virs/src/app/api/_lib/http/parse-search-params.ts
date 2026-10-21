import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

/** The query string, validated against the schema. Empty values count as missing. */
export function parseSearchParams<T>(request: NextRequest, schema: ZodType<T>): T {
  const params: Record<string, string> = {};
  for (const [key, value] of request.nextUrl.searchParams) {
    if (value !== "") params[key] = value;
  }
  return schema.parse(params);
}
