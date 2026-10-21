import "server-only";
import { getDb, user } from "@repo/db";
import { eq } from "drizzle-orm";

/** The account with this user name (user names are stored in lower case). */
export async function findUserByUsername(userName: string) {
  const [match] = await getDb()
    .select()
    .from(user)
    .where(eq(user.username, userName.trim().toLowerCase()))
    .limit(1);
  return match;
}
