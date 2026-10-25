"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SessionProvider } from "@/lib/auth/session-provider";
import type { SessionUser } from "@/lib/auth/session-user";
import { getQueryClient } from "@/lib/get-query-client";
import { cssVariablesResolver } from "@/theme/css-variables-resolver";
import { theme } from "@/theme/theme";

export function Providers({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  // Light only: the site is built for daytime classroom use, not a dark theme.
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="light">
      <QueryClientProvider client={getQueryClient()}>
        <SessionProvider user={user}>{children}</SessionProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
