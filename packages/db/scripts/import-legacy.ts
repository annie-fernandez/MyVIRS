/**
 * One-off migration from the legacy Spring Boot database (MySQL in production, Postgres in dev)
 * into the new schema: copies the word lists and re-creates user accounts with properly hashed
 * passwords.
 *
 *   LEGACY_DATABASE_URL=mysql://... DATABASE_URL=postgres://... pnpm db:import-legacy
 */
import { createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { normalizeWord, parseGrade, parseWordCategory } from "@repo/core";
import { hashPassword } from "better-auth/crypto";
import { createDb } from "../src/client";
import { importWords } from "../src/queries/words";
import { account, user, type NewWordRow } from "../src/schema";

interface LegacyWord {
  value: string;
  category: string;
  grade: string | null;
}

interface LegacyUser {
  full_name: string;
  user_name: string;
  password: string;
  user_level: string | null;
  email: string | null;
  creation_date: Date | string | null;
}

// The Angular app AES-encrypted passwords in the browser with this hardcoded key before
// storing them, so they are recoverable. This is used once here to re-hash them.
const LEGACY_AES_KEY = Buffer.from("7061737323313233", "utf8");

function decryptLegacyPassword(ciphertext: string): string | undefined {
  try {
    const decipher = createDecipheriv("aes-128-cbc", LEGACY_AES_KEY, LEGACY_AES_KEY);
    const plain = Buffer.concat([decipher.update(ciphertext, "base64"), decipher.final()]).toString("utf8");
    return plain || undefined;
  } catch {
    return undefined;
  }
}

async function readLegacy(url: string): Promise<{ words: LegacyWord[]; users: LegacyUser[] }> {
  if (url.startsWith("mysql://")) {
    const mysql = await import("mysql2/promise");
    const connection = await mysql.createConnection(url);
    try {
      const [words] = await connection.query("SELECT value, category, grade FROM word");
      const [users] = await connection.query(
        "SELECT full_name, user_name, password, user_level, email, creation_date FROM user",
      );
      return { words: words as LegacyWord[], users: users as LegacyUser[] };
    } finally {
      await connection.end();
    }
  }

  const { default: postgres } = await import("postgres");
  const sql = postgres(url, { max: 1 });
  try {
    const words = await sql<LegacyWord[]>`SELECT value, category, grade FROM word`;
    const users = await sql<LegacyUser[]>`
      SELECT full_name, user_name, password, user_level, email, creation_date FROM "user"`;
    return { words: [...words], users: [...users] };
  } finally {
    await sql.end();
  }
}

const legacyUrl = process.env.LEGACY_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;
if (!legacyUrl || !targetUrl) throw new Error("LEGACY_DATABASE_URL and DATABASE_URL must be set");

const db = createDb(targetUrl);
const legacy = await readLegacy(legacyUrl);

const wordRows: NewWordRow[] = [];
let skippedWords = 0;
for (const word of legacy.words) {
  const category = parseWordCategory(word.category ?? "");
  const value = normalizeWord(word.value ?? "");
  if (!category || !value) {
    skippedWords++;
    continue;
  }
  wordRows.push({ value, category, grade: word.grade ? (parseGrade(word.grade) ?? null) : null });
}
const importedWords = await importWords(db, wordRows, { replace: true });
console.log(`Words: imported ${importedWords}, skipped ${skippedWords} with an unknown category.`);

const seenEmails = new Set<string>();
const seenUsernames = new Set<string>();
let importedUsers = 0;
let needsReset = 0;
for (const legacyUser of legacy.users) {
  const email = legacyUser.email?.trim().toLowerCase();
  const username = legacyUser.user_name?.trim().toLowerCase();
  if (!email || !username || seenEmails.has(email) || seenUsernames.has(username)) {
    console.warn(`Skipping user "${legacyUser.user_name}": missing or duplicate email/username.`);
    continue;
  }
  seenEmails.add(email);
  seenUsernames.add(username);

  const plain = decryptLegacyPassword(legacyUser.password);
  if (!plain) needsReset++;
  const passwordHash = await hashPassword(plain ?? randomBytes(32).toString("hex"));

  const id = randomUUID();
  const createdAt = legacyUser.creation_date ? new Date(legacyUser.creation_date) : new Date();
  const inserted = await db
    .insert(user)
    .values({
      id,
      name: legacyUser.full_name?.trim() || username,
      email,
      username,
      displayUsername: legacyUser.user_name.trim(),
      userLevel: legacyUser.user_level || null,
      createdAt,
    })
    .onConflictDoNothing()
    .returning({ id: user.id });

  if (inserted.length === 0) continue;
  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: passwordHash,
  });
  importedUsers++;
}
console.log(
  `Users: imported ${importedUsers} of ${legacy.users.length}; ${needsReset} need a password reset (undecryptable password).`,
);
