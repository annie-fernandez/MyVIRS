import type { StoredAnalysis } from "./stored-analysis";

const STORAGE_KEY = "virs:analysis";

const listeners = new Set<() => void>();
/** `undefined` until sessionStorage has been read. Only this tab writes its sessionStorage, so it's read once. */
let current: StoredAnalysis | null | undefined;

/**
 * The latest analysis for this tab, in sessionStorage so the results screens survive a reload.
 * Shaped for useSyncExternalStore: `read` returns the same object until `set` replaces it.
 */
export const analysisStore = {
  read(): StoredAnalysis | null {
    if (current === undefined) {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        current = saved ? (JSON.parse(saved) as StoredAnalysis) : null;
      } catch {
        // Unreadable or blocked storage: start with no analysis.
        current = null;
      }
    }
    return current;
  },

  set(next: StoredAnalysis) {
    current = next;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Very large documents can exceed the storage quota; the result still lives in memory.
    }
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
