"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { queryKeys } from "../query-keys";
import { authClient } from "./auth-client";
import { SessionContext } from "./session-context";
import type { SessionUser } from "./session-user";
import { syncLegacySession } from "./sync-legacy-session";

/**
 * Hands every component the user the server read (see useSession), and keeps the session alive:
 * Server Components can't refresh the session cookie, so this asks /api/auth/get-session on each
 * page load and when the window regains focus. That route extends the session and its cookie.
 */
export function SessionProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const router = useRouter();
  useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const { data, error } = await authClient.getSession();
      if (error) throw error;
      const current = data?.user ?? null;
      // The Angular screens decide who's signed in from localStorage (see sync-legacy-session.ts).
      syncLegacySession(current);
      // Signed in or out somewhere else (another tab, an Angular screen): show the right user here too.
      if ((current?.id ?? null) !== (user?.id ?? null)) router.refresh();
      return current?.id ?? null;
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
  return <SessionContext value={user}>{children}</SessionContext>;
}
