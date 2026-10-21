/** The three account forms, and the title each one shows. */
export const ACCOUNT_FORM_TITLES = {
  login: "Log in to VIRS",
  register: "Create your account",
  recovery: "Reset your password",
} as const;

export type AccountFormView = keyof typeof ACCOUNT_FORM_TITLES;
