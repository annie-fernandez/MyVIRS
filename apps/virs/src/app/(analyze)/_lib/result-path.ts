import type { Route } from "next";

export type ResultView = "enhanced" | "statistics" | "context";

/** The URL of each results view, shared by the analyze screen (where to go) and the results screen (the switch). */
export const RESULT_PATH: Record<ResultView, Route> = { enhanced: "/enhanced-text-result", statistics: "/text-statistics", context: "/context-words" };
