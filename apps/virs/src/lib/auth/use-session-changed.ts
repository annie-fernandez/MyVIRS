"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/** Call after logging in, registering or saving the profile: every screen then shows the new session. */
export function useSessionChanged() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return () => {
    // Refetches the session and everything loaded for the old one.
    void queryClient.invalidateQueries();
    // Re-renders the root layout, which hands SessionProvider the new user.
    router.refresh();
  };
}
