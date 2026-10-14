import type { Session } from "./auth-client";

// The Angular UI decides whether someone is signed in from these localStorage keys, not from the
// session cookie (see apps/web sidebar.component.ts). Mantine pages read the real session, so they
// rewrite the keys to match it; otherwise a Mantine sign-in looks signed out on Angular screens,
// and an expired session still looks signed in there.
const LEGACY_KEYS = ["currentUser", "userName", "level", "email"] as const;

export function syncLegacySession(user: Session["user"] | null | undefined): void {
  try {
    if (!user) {
      for (const key of LEGACY_KEYS) localStorage.removeItem(key);
      return;
    }
    localStorage.setItem("currentUser", user.name);
    localStorage.setItem("userName", user.displayUsername ?? user.username ?? "");
    localStorage.setItem("level", user.userLevel ?? "");
    localStorage.setItem("email", user.email);
  } catch {
    // Storage can be unavailable (private mode, blocked site data). Angular then shows signed out.
  }
}
