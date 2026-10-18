import { sql } from "drizzle-orm";
import { check, index, pgTable, smallint, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { analysis } from "./history";

// One row per rating a student gives a word, never updated. The latest row per word is the
// current rating; the earlier ones are what the progress charts are drawn from.
export const wordRating = pgTable(
  "word_rating",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Normalized like the word lists (lower case, no surrounding punctuation). */
    word: varchar("word", { length: 256 }).notNull(),
    /** 1 "Never seen it" … 5 "I'm super confident"; see RATING_VALUES in @repo/core. */
    rating: smallint("rating").notNull(),
    /** The sentence the word was rated from, so the student can see it in context later. */
    context: text("context"),
    /** The saved analysis the word was rated from, if any. Kept when that analysis is deleted. */
    analysisId: uuid("analysis_id").references(() => analysis.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("word_rating_rating_range", sql`${table.rating} between 1 and 5`),
    index("word_rating_user_word_created_idx").on(table.userId, table.word, table.createdAt.desc()),
    index("word_rating_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type WordRatingRow = typeof wordRating.$inferSelect;
