import type { ReactNode } from "react";

/** A result message under an admin form: green when it worked, red when it didn't. */
export type Notice = { color: "virsGreen" | "red"; message: ReactNode } | null;
