/**
 * Team A's ranked word lists that the Analysis by context screen offers. Each file is their
 * contract v1 output, copied in unchanged (see @repo/core context-ranking.ts). To add or replace a
 * list, drop their new file in files/ and point an entry at it.
 */
export const CONTEXT_LISTS: Record<string, { title: string; note: string; load: () => Promise<unknown> }> = {
  "ck12-biology": {
    title: "CK-12 Biology",
    note:
      "Team A's ranking of the whole CK-12 Biology textbook (capstone2myvirs, commit 86d2a3e, October 18, 2026). " +
      "Its frequency bands come from a temporary 2,300-word list, so some science words show as High; " +
      "Team A will send a new file made with the full word lists.",
    load: () => import("./files/ck12-biology.json").then((file) => file.default),
  },
};
