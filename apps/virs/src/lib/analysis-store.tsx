"use client";

import type { AnalysisResult } from "@repo/core";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "virs:analysis";

export interface StoredAnalysis {
  result: AnalysisResult;
  /** Human-readable origin, e.g. "Pasted text" or a file name. */
  source: string;
  analyzedAt: string;
}

interface AnalysisContextValue {
  analysis: StoredAnalysis | null;
  hydrated: boolean;
  setAnalysis: (analysis: StoredAnalysis) => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setState] = useState<StoredAnalysis | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved) as StoredAnalysis);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  const setAnalysis = useCallback((next: StoredAnalysis) => {
    setState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Very large documents can exceed the storage quota; the result still lives in memory.
      sessionStorage.removeItem(STORAGE_KEY);
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
