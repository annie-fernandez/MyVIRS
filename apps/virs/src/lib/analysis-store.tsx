"use client";

import type { AnalysisResult } from "@repo/core";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "virs:analysis";

export interface StoredAnalysis {
  result: AnalysisResult;
  /** Where the text came from, e.g. "Pasted text" or a file name. */
  source: string;
  analyzedAt: string;
  /** Set when the analysis is in the signed-in user's history; absent or null when it wasn't saved. */
  historyId?: string | null;
}

interface AnalysisContextValue {
  analysis: StoredAnalysis | null;
  /** False until sessionStorage has been read, so screens don't flash "no results". */
  hydrated: boolean;
  setAnalysis: (analysis: StoredAnalysis) => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

/** Keeps the latest analysis for this tab, so the results screens survive a reload. */
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setState] = useState<StoredAnalysis | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved) as StoredAnalysis);
    } catch {
      // Unreadable or blocked storage: start with no analysis.
    }
    setHydrated(true);
  }, []);

  const setAnalysis = useCallback((next: StoredAnalysis) => {
    setState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Very large documents can exceed the storage quota; the result still lives in memory.
    }
  }, []);

  const value = useMemo(() => ({ analysis, hydrated, setAnalysis }), [analysis, hydrated, setAnalysis]);
  return <AnalysisContext value={value}>{children}</AnalysisContext>;
}

export function useAnalysis(): AnalysisContextValue {
  const context = use(AnalysisContext);
  if (!context) throw new Error("useAnalysis must be used inside AnalysisProvider");
  return context;
}
