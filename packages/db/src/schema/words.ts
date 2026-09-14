import { GRADES, WORD_CATEGORIES } from "@repo/core";
import { index, integer, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const wordCategoryEnum = pgEnum("word_category", WORD_CATEGORIES);
export const gradeEnum = pgEnum("grade", GRADES);

export const words = pgTable(
  "words",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    value: varchar("value", { length: 256 }).notNull(),
    category: wordCategoryEnum("category").notNull(),
    grade: gradeEnum("grade"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("words_value_category_key").on(table.value, table.category),
    index("words_category_grade_value_idx").on(table.category, table.grade, table.value),
  ],
);

export type WordRow = typeof words.$inferSelect;
export type NewWordRow = typeof words.$inferInsert;
