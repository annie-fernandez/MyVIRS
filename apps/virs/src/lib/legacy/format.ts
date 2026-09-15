import "server-only";
import { createDecipheriv } from "node:crypto";
import type { AnalysisResult, Paginated, Word, WordCategory } from "@repo/core";

// Adapters that let the original Angular UI (served from /public) talk to the new API.
// They reproduce the response shapes of the old Spring Boot endpoints.

// The Angular app AES-encrypts passwords in the browser with this hardcoded key before
// sending them. It is not a security boundary (the key ships in the JS bundle); the server
// just reverses it and hands the plain password to Better Auth, which hashes it.
const LEGACY_AES_KEY = Buffer.from("7061737323313233", "utf8");

export function decryptLegacyPassword(ciphertext: unknown): string | undefined {
  if (typeof ciphertext !== "string" || !ciphertext) return undefined;
  try {
    const decipher = createDecipheriv("aes-128-cbc", LEGACY_AES_KEY, LEGACY_AES_KEY);
    const plain = Buffer.concat([decipher.update(ciphertext, "base64"), decipher.final()]).toString("utf8");
    return plain || undefined;
  } catch {
    return undefined;
  }
}

/** The old database stored K-lists in upper case ("K1") and the rest in lower case ("awl"). */
export function toLegacyCategory(category: WordCategory | null): string {
  if (!category) return "";
  return category.startsWith("k") ? category.toUpperCase() : category;
}

export function toLegacyWord(word: Word) {
  return { id: word.id, value: word.value, category: toLegacyCategory(word.category), grade: word.grade };
}

export function toLegacyText(result: AnalysisResult) {
  const { wordCount, wordPercentage } = result.statistics;
  const breakdown = (source: typeof wordPercentage, total: number) => ({
    stem: source.stem,
    awl: source.awl,
    hi: source.hi,
    med: source.med,
    low: source.low,
    noCategory: source.offList,
    k1: source.k1,
    k2: source.k2,
    k3: source.k3,
    total,
  });

  return {
    words: result.words.map((word) => ({
      value: word.value ?? "",
      category: toLegacyCategory(word.category),
      initialValue: word.initialValue,
    })),
    fleschReadingScore: result.fleschReadingScore,
    sentenceCount: result.sentenceCount,
    statistics: {
      wordCount: breakdown(wordCount, wordCount.total),
      wordPercentage: breakdown(wordPercentage, wordCount.total === 0 ? 0 : 1),
    },
  };
}

/** Spring Data `Page` JSON, with a zero-based page number. */
export function toLegacyPage(page: Paginated<Word>) {
  const number = page.page - 1;
  return {
    content: page.items.map(toLegacyWord),
    number,
    size: page.pageSize,
    numberOfElements: page.items.length,
    totalElements: page.total,
    totalPages: page.totalPages,
    first: number === 0,
    last: page.page >= page.totalPages,
    sort: [],
  };
}

export interface LegacyUserSource {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  displayUsername?: string | null;
  userLevel?: string | null;
}

/** The old `User` JSON, minus the password the old API used to leak. */
export function toLegacyUser(user: LegacyUserSource) {
  return {
    id: user.id,
    fullName: user.name,
    userName: user.displayUsername ?? user.username ?? "",
    email: user.email,
    userLevel: user.userLevel || null,
  };
}

/** Empty 200 response. The Angular services treat this as success via their error handler. */
export function emptyOk(): Response {
  return new Response(null, { status: 200 });
}
