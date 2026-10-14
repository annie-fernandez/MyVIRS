"use client";

import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { AnalysisProvider } from "@/lib/analysis-store";
import { cssVariablesResolver, theme } from "@/theme";

export function Providers({ children }: { children: ReactNode }) {
  // Light only: the Angular screens still live alongside these, and a dark Mantine screen next to
  // them would read as a different site.
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="light">
      <AnalysisProvider>{children}</AnalysisProvider>
    </MantineProvider>
  );
}
