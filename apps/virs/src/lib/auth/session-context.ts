"use client";

import { createContext } from "react";
import type { SessionUser } from "./session-user";

/** The signed-in user, read once on the server by the root layout; null when signed out. */
export const SessionContext = createContext<SessionUser | null>(null);
