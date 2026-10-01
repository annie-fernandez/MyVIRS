import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function request(target = "es", text = "Hello world & friends") {
  return new NextRequest("http://localhost:3000/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target }),
  });
}

beforeEach(() => {
  vi.stubEnv("MICROSOFT_TRANSLATOR_KEY", "test-key");
  vi.stubEnv("MICROSOFT_TRANSLATOR_REGION", "eastus");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Microsoft translation route", () => {
  it("uses authenticated Microsoft requests and preserves the public response shape", async () => {
    const upstream = vi.fn().mockResolvedValue(
      Response.json([
        {
          detectedLanguage: { language: "en", score: 1 },
          translations: [{ text: "Hola mundo y amigos", to: "es" }],
        },
      ]),
    );
    vi.stubGlobal("fetch", upstream);
    const response = await POST(request(), undefined);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      translatedText: "Hola mundo y amigos",
      sourceLanguage: "en",
      target: "es",
    });
    expect(upstream).toHaveBeenCalledTimes(1);
    const [url, options] = upstream.mock.calls[0]!;
    expect(url.origin).toBe("https://api.cognitive.microsofttranslator.com");
    expect(url.pathname).toBe("/translate");
    expect(url.searchParams.get("api-version")).toBe("3.0");
    expect(url.searchParams.get("to")).toBe("es");
    expect(url.searchParams.has("from")).toBe(false);
    expect(url.toString()).not.toContain("test-key");
    expect(options.headers.get("Ocp-Apim-Subscription-Key")).toBe("test-key");
    expect(options.headers.get("Ocp-Apim-Subscription-Region")).toBe("eastus");
    expect(JSON.parse(options.body)).toEqual([
      { Text: "Hello world & friends" },
    ]);
  });

  it.each(["zh-Hans", "zh-CN"])(
    "supports Microsoft script codes and the legacy alias %s",
    async (target) => {
      const upstream = vi.fn().mockResolvedValue(
        Response.json([
          {
            translations: [{ text: "你好", to: "zh-Hans" }],
          },
        ]),
      );
      vi.stubGlobal("fetch", upstream);
      vi.stubEnv("MICROSOFT_TRANSLATOR_REGION", "");
      const response = await POST(request(target), undefined);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        translatedText: "你好",
        sourceLanguage: null,
        target,
      });
      expect(upstream.mock.calls[0]![0].searchParams.get("to")).toBe("zh-Hans");
      expect(
        upstream.mock.calls[0]![1].headers.has("Ocp-Apim-Subscription-Region"),
      ).toBe(false);
    },
  );

  it("fails without a subscription key and never calls an unofficial fallback", async () => {
    vi.stubEnv("MICROSOFT_TRANSLATOR_KEY", "");
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);
    const response = await POST(request(), undefined);
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe("server_misconfigured");
    expect(upstream).not.toHaveBeenCalled();
  });

  it("rejects oversized input before using the translation allowance", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);
    const response = await POST(request("es", "x".repeat(5001)), undefined);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it.each([
    [429, 429000, 429, "translation_rate_limited"],
    [403, 403001, 503, "translation_quota_exceeded"],
    [401, 401000, 503, "translation_unavailable"],
    [403, 403000, 503, "translation_unavailable"],
    [400, 400036, 400, "translation_language_unsupported"],
    [503, 503000, 502, "translation_unavailable"],
  ])(
    "handles provider status %i/code %i without exposing provider details",
    async (status, code, expectedStatus, expectedCode) => {
      const upstream = vi.fn().mockResolvedValue(
        Response.json(
          { error: { code, message: "private provider details" } },
          {
            status,
            headers: { "Retry-After": "60" },
          },
        ),
      );
      vi.stubGlobal("fetch", upstream);
      const response = await POST(request(), undefined);
      expect(response.status).toBe(expectedStatus);
      const body = await response.json();
      expect(body.error.code).toBe(expectedCode);
      expect(JSON.stringify(body)).not.toContain("private provider details");
      if (status === 429) expect(body.error.details.retryAfterSeconds).toBe(60);
      expect(upstream).toHaveBeenCalledTimes(1);
    },
  );

  it.each([null, [], [{ translations: [{ text: "wrong target", to: "fr" }] }]])(
    "handles malformed provider results",
    async (payload) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(payload)));
      const response = await POST(request(), undefined);
      expect(response.status).toBe(502);
      expect((await response.json()).error.code).toBe(
        "translation_unavailable",
      );
    },
  );

  it.each([
    [new TypeError("network failed"), 502, "translation_unavailable"],
    [new DOMException("timed out", "TimeoutError"), 504, "translation_timeout"],
  ])("handles network failure and timeouts", async (error, status, code) => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    const response = await POST(request(), undefined);
    expect(response.status).toBe(status);
    expect((await response.json()).error.code).toBe(code);
  });
});
