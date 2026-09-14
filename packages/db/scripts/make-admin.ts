import { eq } from "drizzle-orm";
import { createDb } from "../src/client";
import { user } from "../src/schema";

const username = process.argv[2]?.trim().toLowerCase();
if (!username) {
  console.error("Usage: pnpm db:make-admin <username>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const updated = await createDb(url)
  .update(user)
  .set({ role: "admin" })
  .where(eq(user.username, username))
  .returning({ id: user.id });

if (updated.length === 0) {
  console.error(`No user with username "${username}". Register the account first.`);
  process.exit(1);
}
console.log(`${username} is now an admin.`);
