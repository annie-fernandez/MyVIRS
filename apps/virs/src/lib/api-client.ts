import type { ApiErrorBody } from "@repo/core";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

/** Calls the app's own API routes and turns error envelopes into ApiClientError. */
export async function apiFetch<T>(path: string, { json, headers, ...init }: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: json === undefined ? headers : { "Content-Type": "application/json", ...headers },
    body: json === undefined ? init.body : JSON.stringify(json),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiClientError(
      response.status,
      body?.error.code ?? "http_error",
      body?.error.message ?? "Something went wrong. Please try again.",
      body?.error.details,
    );
  }

  if (response.status === 204 || response.status === 202) return undefined as T;
  return (await response.json()) as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
