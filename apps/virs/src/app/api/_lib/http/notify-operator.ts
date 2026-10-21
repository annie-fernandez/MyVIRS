import "server-only";
import { after, type NextRequest } from "next/server";
import { reportServerError } from "./report-server-error";

/** Emails the operator about an unexpected error, after the response has gone out. */
export function notifyOperator(request: NextRequest, error: unknown) {
  const where = { method: request.method, path: request.nextUrl.pathname };
  after(() => {
    void reportServerError(error, where);
  });
}
