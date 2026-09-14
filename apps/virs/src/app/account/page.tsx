import { USER_LEVELS, type UserLevel } from "@repo/core";
import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";
import { requirePageSession } from "@/lib/session";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { user } = await requirePageSession("/account");
  const userLevel = (USER_LEVELS as readonly string[]).includes(user.userLevel ?? "") ? (user.userLevel as UserLevel) : null;

  return (
    <AccountView
      user={{
        name: user.name,
        email: user.email,
        username: user.displayUsername ?? user.username ?? "",
        userLevel,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
