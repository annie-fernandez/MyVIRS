import type { Paginated, Word } from "@repo/core";
import { toLegacyWord } from "./to-legacy-word";

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
