"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AnalysisProvider } from "@/lib/analysis-store";
import { theme } from "@/theme";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <QueryClientProvider client={queryClient}>
        <ModalsProvider labels={{ confirm: "Confirm", cancel: "Cancel" }}>
          <Notifications position="bottom-right" />
          <AnalysisProvider>{children}</AnalysisProvider>
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
