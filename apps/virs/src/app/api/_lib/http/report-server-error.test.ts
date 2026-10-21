import { afterEach, describe, expect, it, vi } from "vitest";
import { reportServerError } from "./report-server-error";

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
