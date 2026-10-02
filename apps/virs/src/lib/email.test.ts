import { afterEach, describe, expect, it, vi } from "vitest";
import { formatErrorReport, reportServerError } from "./email";

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

describe("reportServerError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the operator report to the log when Resend is not configured", async () => {
    process.env.DATABASE_URL ??= "postgresql://localhost/virs";
    process.env.BETTER_AUTH_SECRET ??= "local-test-secret-not-used-anywhere";
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    await reportServerError(new Error("database down"), { method: "POST", path: "/api/analyze/text" });
    const logged = spy.mock.calls.map((call) => call.map(String).join(" ")).join("\n");
    expect(logged).toContain("vocabinreading@gmail.com");
    expect(logged).toContain("POST /api/analyze/text");
    expect(logged).toContain("database down");
  });
});
