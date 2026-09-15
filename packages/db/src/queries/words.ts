import type {
  AdminWordInput,
  Paginated,
  Word,
  WordCategory,
  WordListEntry,
  WordSearchQuery,
} from "@repo/core";
import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { Database } from "../client";
import { words, type NewWordRow } from "../schema";

const wordColumns = {
  id: words.id,
  value: words.value,
  category: words.category,
  grade: words.grade,
} as const;

// Postgres allows 65,535 bind parameters per statement; 3 columns per row stays well below.
const INSERT_CHUNK_SIZE = 5_000;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function lookupWords(db: Database, values: string[]): Promise<WordListEntry[]> {
  if (values.length === 0) return [];
  return db
    .select({ value: words.value, category: words.category })
    .from(words)
    .where(inArray(words.value, values));
}

export async function searchWords(db: Database, query: WordSearchQuery): Promise<Paginated<Word>> {
  const where = and(
    eq(words.category, query.category),
    query.grade ? eq(words.grade, query.grade) : undefined,
    query.q ? ilike(words.value, `${escapeLike(query.q)}%`) : undefined,
  );

  const [items, totals] = await Promise.all([
    db
      .select(wordColumns)
      .from(words)
      .where(where)
      .orderBy(query.sort === "asc" ? asc(words.value) : desc(words.value))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ total: count() }).from(words).where(where),
  ]);

  const total = totals[0]?.total ?? 0;
  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

/** Every list entry for a value — a word may appear in several categories. */
export async function findWordsByValue(db: Database, value: string): Promise<Word[]> {
  return db
    .select(wordColumns)
    .from(words)
    .where(eq(words.value, value.trim().toLowerCase()))
    .orderBy(asc(words.category));
}

export async function listWordsByCategories(
  db: Database,
  categories: WordCategory[],
): Promise<Word[]> {
  return db
    .select(wordColumns)
    .from(words)
    .where(inArray(words.category, categories))
    .orderBy(asc(words.category), asc(words.value));
}

export async function listAllWords(db: Database): Promise<Word[]> {
  return db.select(wordColumns).from(words).orderBy(asc(words.category), asc(words.value));
}

export async function upsertWord(db: Database, input: AdminWordInput): Promise<Word> {
  const [row] = await db
    .insert(words)
    .values({ value: input.value, category: input.category, grade: input.grade ?? null })
    .onConflictDoUpdate({
      target: [words.value, words.category],
      // An omitted grade keeps the existing one; an explicit null clears it.
      set: input.grade === undefined ? { updatedAt: new Date() } : { grade: input.grade, updatedAt: new Date() },
    })
    .returning(wordColumns);
  return row!;
}

export async function updateWord(
  db: Database,
  id: number,
  input: AdminWordInput,
): Promise<Word | undefined> {
  const [row] = await db
    .update(words)
    .set({
      value: input.value,
      category: input.category,
      ...(input.grade === undefined ? {} : { grade: input.grade }),
    })
    .where(eq(words.id, id))
    .returning(wordColumns);
  return row;
}

export async function deleteWord(db: Database, id: number): Promise<boolean> {
  const deleted = await db.delete(words).where(eq(words.id, id)).returning({ id: words.id });
  return deleted.length > 0;
}

export async function deleteWordsByValue(db: Database, value: string): Promise<number> {
  const deleted = await db.delete(words).where(eq(words.value, value)).returning({ id: words.id });
  return deleted.length;
}

export async function deleteWordsByCategory(db: Database, category: WordCategory): Promise<number> {
  const deleted = await db
    .delete(words)
    .where(eq(words.category, category))
    .returning({ id: words.id });
  return deleted.length;
}

export interface ImportWordsOptions {
  /** Delete existing words first: only in `category` when given, otherwise the whole table. */
  replace: boolean;
  category?: WordCategory;
}

/** Inserts or updates words atomically; with `replace`, the delete runs in the same transaction. */
export async function importWords(
  db: Database,
  rows: NewWordRow[],
  { replace, category }: ImportWordsOptions,
): Promise<number> {
  const unique = new Map<string, NewWordRow>();
  for (const row of rows) unique.set(`${row.category}:${row.value}`, row);

  const inserts = chunk([...unique.values()], INSERT_CHUNK_SIZE).map((batch) =>
    db
      .insert(words)
      .values(batch)
      .onConflictDoUpdate({
        target: [words.value, words.category],
        set: { grade: sql`excluded.grade`, updatedAt: new Date() },
      }),
  );

  const statements = replace
    ? [db.delete(words).where(category ? eq(words.category, category) : undefined), ...inserts]
    : inserts;

  if (statements.length === 0) return 0;
  const [first, ...rest] = statements;
  await db.batch([first!, ...rest]);
  return unique.size;
}
