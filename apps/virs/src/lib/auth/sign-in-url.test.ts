import { describe, expect, it } from "vitest";
import { signInUrl } from "./sign-in-url";

describe("signInUrl", () => {
  it("says what the page is for and comes back to it", () => {
    const url = new URL(signInUrl("/history?tab=words"), "https://example.com");
    expect(url.pathname).toBe("/sign-in");
    expect(url.searchParams.get("title")).toBe("Log in to see your history");
    expect(url.searchParams.get("next")).toBe("/history?tab=words");
  });

  it("leaves the title to the sign-in page's default for a page it doesn't know", () => {
    const url = new URL(signInUrl("/somewhere"), "https://example.com");
    expect(url.searchParams.has("title")).toBe(false);
    expect(url.searchParams.get("next")).toBe("/somewhere");
  });
});
