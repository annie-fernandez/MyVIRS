import type { ZodType } from "zod";
import { HttpError } from "./http-error";

/** The request's JSON body, validated against the schema. */
export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw HttpError.badRequest("Request body must be valid JSON.");
  }
  return schema.parse(body);
}
