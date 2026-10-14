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

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/** Calls the app's own API routes and turns their error envelopes into ApiClientError. */
export async function apiFetch<T>(path: string, { json, headers, ...init }: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: json === undefined ? headers : { "Content-Type": "application/json", ...headers },
      body: json === undefined ? init.body : JSON.stringify(json),
    });
  } catch {
    throw new ApiClientError(0, "network_error", "We couldn't reach VIRS. Check your connection and try again.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiClientError(
      response.status,
      body?.error?.code ?? "http_error",
      body?.error?.message ?? FALLBACK_MESSAGE,
      body?.error?.details,
    );
  }

  if (response.status === 204 || response.status === 202) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : FALLBACK_MESSAGE;
}
