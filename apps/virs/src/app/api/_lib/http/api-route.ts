import "server-only";
import type { ApiErrorBody } from "@repo/core";
import type { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { EnvConfigError } from "@/lib/env/env-config-error";
import { HttpError } from "./http-error";
import { notifyOperator } from "./notify-operator";

/** Wraps a route handler with consistent JSON error responses. Unexpected errors never leak details. */
export function apiRoute<Context>(
  handler: (request: NextRequest, context: Context) => Promise<Response>,
) {
  return async (request: NextRequest, context: Context): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        const body: ApiErrorBody = { error: { code: error.code, message: error.message, details: error.details } };
        return Response.json(body, { status: error.status });
      }
      // A bad environment variable is our fault, not the caller's: never a 400,
      // and never echo the variable names back to the client.
      if (error instanceof EnvConfigError) {
        console.error(`[api] ${request.method} ${request.nextUrl.pathname} — ${error.message}`);
        notifyOperator(request, error);
        const body: ApiErrorBody = { error: { code: "server_misconfigured", message: "The server is not configured correctly." } };
        return Response.json(body, { status: 500 });
      }
      if (error instanceof ZodError) {
        const body: ApiErrorBody = { error: { code: "validation_error", message: "The request is invalid.", details: z.flattenError(error) } };
        return Response.json(body, { status: 400 });
      }
      console.error(`[api] ${request.method} ${request.nextUrl.pathname}`, error);
      notifyOperator(request, error);
      const body: ApiErrorBody = { error: { code: "internal_error", message: "Something went wrong. Please try again." } };
      return Response.json(body, { status: 500 });
    }
  };
}
