"use client";

import { Modal } from "@mantine/core";
import { ACCOUNT_FORM_TITLES, type AccountFormView } from "./account-form-view";
import { AccountForms } from "./account-forms";

/**
 * The account pop-up: log in, create an account, or reset a password. The one way to log in, used
 * by the side menu's Log in button and by the sign-in page's buttons, so there's never a second form.
 */
export function AccountModal({ view, onViewChange, onSignedIn }: { view: AccountFormView | null; onViewChange: (view: AccountFormView | null) => void; onSignedIn: () => void }) {
  return (
    <Modal opened={view !== null} onClose={() => onViewChange(null)} title={view && ACCOUNT_FORM_TITLES[view]}>
      {view && <AccountForms view={view} onViewChange={onViewChange} onSignedIn={onSignedIn} />}
    </Modal>
  );
}
