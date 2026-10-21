/** What the sign-in page says, for each page that needs an account. */
const TITLES: Record<string, string> = {
  "/history": "Log in to see your history",
  "/account": "Log in to see your profile",
  "/change-password": "Log in to change your password",
  "/admin": "Log in to manage the word lists",
};

/**
 * The sign-in page for a visitor who opened a page that needs an account: it says what they were
 * trying to do (`title`; by default the page's own, from the list above) and sends them back to that
 * page (`next`) once they've logged in.
 */
export function signInUrl(next: string, title = TITLES[`/${next.split(/[/?#]/)[1] ?? ""}`]): string {
  const params = new URLSearchParams({ next });
  if (title) params.set("title", title);
  return `/sign-in?${params.toString()}`;
}
