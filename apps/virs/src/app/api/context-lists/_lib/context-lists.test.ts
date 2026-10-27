import { describe, expect, it } from "vitest";
import { CONTEXT_LISTS } from "./context-lists";
import { loadContextList } from "./load-context-list";

describe("Team A's context lists", () => {
  it.each(Object.keys(CONTEXT_LISTS))("%s matches contract v1 and is ranked 1 to n", async (id) => {
    const { list, ranking } = (await loadContextList(id))!;
    expect(list.wordCount).toBeGreaterThan(0);
    expect(ranking.words.map((word) => word.rank)).toEqual(ranking.words.map((_, index) => index + 1));
  });

  it("knows nothing about an unknown id", () => {
    expect(loadContextList("no-such-list")).toBeUndefined();
    expect(loadContextList("toString")).toBeUndefined();
  });
});
