import "server-only";
import { getDb, user } from "@repo/db";
import { eq, sql } from "drizzle-orm";

/** The account with this email, ignoring case. */
export async function findUserByEmail(email: string) {
  const [match] = await getDb()
    .select()
    .from(user)
    .where(eq(sql`lower(${user.email})`, email.trim().toLowerCase()))
    .limit(1);
  return match;
}
