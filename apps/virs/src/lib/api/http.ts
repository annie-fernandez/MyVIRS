import "server-only";
import type { ApiErrorBody } from "@repo/core";
import type { NextRequest } from "next/server";
import { z, ZodError, type ZodType } from "zod";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, "bad_request", message, details);
export const unauthorized = () => new HttpError(401, "unauthorized", "Sign in to continue.");
export const forbidden = () => new HttpError(403, "forbidden", "You do not have access to this resource.");
export const notFound = (message = "Not found.") => new HttpError(404, "not_found", message);

function errorResponse(status: number, body: ApiErrorBody): Response {
  return Response.json(body, { status });
}

/** Wraps a route handler with consistent JSON error responses. Unexpected errors never leak details. */
export function route<Context>(
  handler: (request: NextRequest, context: Context) => Promise<Response>,
) {
  return async (request: NextRequest, context: Context): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.status, {
          error: { code: error.code, message: error.message, details: error.details },
        });
      }
      if (error instanceof ZodError) {
        return errorResponse(400, {
          error: {
            code: "validation_error",
            message: "The request is invalid.",
            details: z.flattenError(error),
          },
        });
      }
      console.error(`[api] ${request.method} ${request.nextUrl.pathname}`, error);
      return errorResponse(500, {
        error: { code: "internal_error", message: "Something went wrong. Please try again." },
      });
    }
  };
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
  return schema.parse(body);
}

export function parseSearchParams<T>(request: NextRequest, schema: ZodType<T>): T {
  const params: Record<string, string> = {};
  for (const [key, value] of request.nextUrl.searchParams) {
    if (value !== "") params[key] = value;
  }
  return schema.parse(params);
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) throw badRequest("Invalid id.");
  return id;
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
