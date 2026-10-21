"use client";

import type { AccountFormView } from "./account-form-view";
import { LoginForm } from "./login-form";
import { RecoveryForm } from "./recovery-form";
import { RegisterForm } from "./register-form";

/**
 * Log in, create an account, or reset a password: one of the three, with links between them.
 * Shown in the header's pop-up and on the sign-in page; each decides what happens once signed in.
 */
export function AccountForms({ view, onViewChange, onSignedIn }: { view: AccountFormView; onViewChange: (view: AccountFormView) => void; onSignedIn: () => void }) {
  if (view === "register") return <RegisterForm onSuccess={onSignedIn} onLogin={() => onViewChange("login")} />;
  if (view === "recovery") return <RecoveryForm onLogin={() => onViewChange("login")} />;
  return <LoginForm onSuccess={onSignedIn} onForgot={() => onViewChange("recovery")} onRegister={() => onViewChange("register")} />;
}
