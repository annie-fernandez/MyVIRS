import { ANALYSIS_SOURCE_KINDS } from "@repo/core";
import type { TextStatistics, WordMatch } from "@repo/core";
import { index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const analysisSourceKindEnum = pgEnum("analysis_source_kind", ANALYSIS_SOURCE_KINDS);

// A saved analysis is a snapshot, not a recipe. Admins can edit the word lists at any time, so
// re-running the analyzer later would silently change a student's saved work — the computed
// statistics and matches are therefore stored as they were, and never recomputed on read.
export const analysis = pgTable(
  "analysis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Null for analyses run while signed out, which stays supported.
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sourceKind: analysisSourceKindEnum("source_kind").notNull(),
    /** User-editable label; defaults to a truncated first line of the text. */
    title: text("title"),
    inputText: text("input_text").notNull(),
    sentenceCount: integer("sentence_count").notNull(),
    fleschReadingScore: real("flesch_reading_score").notNull(),
    statistics: jsonb("statistics").$type<TextStatistics>().notNull(),
    wordMatches: jsonb("word_matches").$type<WordMatch[]>().notNull(),
  },
  (table) => [index("analysis_user_created_idx").on(table.userId, table.createdAt.desc())],
);

export type AnalysisRow = typeof analysis.$inferSelect;
export type NewAnalysisRow = typeof analysis.$inferInsert;
