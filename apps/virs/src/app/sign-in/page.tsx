import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-server-session";
import { SignInScreen } from "./_components/sign-in-screen";
import { safeNextPath } from "./_lib/safe-next-path";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

/** Longest title shown from the URL: it's free text, so keep a crafted link from filling the page. */
const MAX_TITLE_LENGTH = 120;

/**
 * Where signed-out visitors are sent when something needs an account:
 * /sign-in?title=<what needs an account>&next=<where to go afterwards>, plus view=register to start
 * on the sign-up form. Someone already signed in goes straight on to `next`.
 */
export default async function Page({ searchParams }: PageProps<"/sign-in">) {
  const { title, next, view } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : null);
  if (await getServerSession()) redirect(nextPath ?? "/dashboard");
  const heading = typeof title === "string" && title.trim() ? title.trim().slice(0, MAX_TITLE_LENGTH) : "Log in to continue";
  return <SignInScreen title={heading} next={nextPath} startWith={view === "register" ? "register" : "login"} />;
}
