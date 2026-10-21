import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("keeps a page on this site, with its query", () => {
    expect(safeNextPath("/history")).toBe("/history");
    expect(safeNextPath("/account?tab=1")).toBe("/account?tab=1");
  });

  it("refuses anything a browser would treat as another site", () => {
    for (const next of ["//evil.com", "/\\evil.com", "https://evil.com", "evil.com", "", null, undefined]) {
      expect(safeNextPath(next)).toBeNull();
    }
  });
});
