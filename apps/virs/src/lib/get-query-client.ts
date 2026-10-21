import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { ApiClientError } from "./api-client/api-client-error";

const CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Data here only changes when this user changes it, and those changes update the cache.
      staleTime: 30_000,
      // A 4xx (not signed in, not found, bad input) won't fix itself; retry network and server errors only.
      retry: (failures, error) => !(error instanceof ApiClientError && error.status >= 400 && error.status < 500) && failures < 2,
      refetchOnWindowFocus: false,
    },
  },
};

let browserQueryClient: QueryClient | undefined;

/** A new client for each server render, so users never share data; one shared client in the browser. */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return new QueryClient(CONFIG);
  browserQueryClient ??= new QueryClient(CONFIG);
  return browserQueryClient;
}
