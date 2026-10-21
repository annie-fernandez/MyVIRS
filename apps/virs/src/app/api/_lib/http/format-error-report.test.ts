import { describe, expect, it } from "vitest";
import { formatErrorReport } from "./format-error-report";

describe("formatErrorReport", () => {
  it("includes the route and the error without treating it as user input to display raw", () => {
    const report = formatErrorReport(new Error("database down"), { method: "POST", path: "/api/analyze/text" });
    expect(report.subject).toBe("Vocabulary in Reading application error");
    expect(report.text).toContain("POST /api/analyze/text");
    expect(report.text).toContain("database down");
    expect(report.html).toContain("POST /api/analyze/text");
    expect(report.html).not.toContain("<script>");
  });

  it("escapes HTML in the error message", () => {
    const report = formatErrorReport(new Error("<script>alert(1)</script>"), { method: "GET", path: "/api/user" });
    expect(report.html).toContain("&lt;script&gt;");
    expect(report.html).not.toContain("<script>alert");
  });
});
