"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";

/** Logs out on this browser, and forgets everything loaded for that user. */
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => authClient.signOut(),
    // Settled, not success: after Delete account the session is already gone and signing out fails,
    // but this browser still has to forget the user.
    onSettled: () => {
      // So the next person on this browser never sees the last user's progress or history.
      queryClient.clear();
      router.refresh();
    },
  });
}
