"use client";

import { useSyncExternalStore } from "react";
import { analysisStore } from "./analysis-store";
import type { StoredAnalysis } from "./stored-analysis";

/** The latest analysis, `null` when there isn't one, or `undefined` until the browser has read storage. */
export function useAnalysis(): StoredAnalysis | null | undefined {
  return useSyncExternalStore(analysisStore.subscribe, analysisStore.read, () => undefined);
}
