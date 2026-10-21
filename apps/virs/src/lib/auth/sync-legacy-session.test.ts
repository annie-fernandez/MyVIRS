import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncLegacySession } from "./sync-legacy-session";

function fakeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, String(value)),
    removeItem: (key: string) => void values.delete(key),
  };
}

const user = {
  name: "Ana Diaz",
  email: "ana@example.com",
  username: "ana",
  displayUsername: "Ana",
  userLevel: null,
};

describe("syncLegacySession", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes the keys the Angular sidebar reads to decide someone is signed in", () => {
    syncLegacySession(user);
    expect(localStorage.getItem("currentUser")).toBe("Ana Diaz");
    expect(localStorage.getItem("userName")).toBe("Ana");
    expect(localStorage.getItem("email")).toBe("ana@example.com");
    // Angular's account screen normalizes a missing level to "" (not the string "null").
    expect(localStorage.getItem("level")).toBe("");
  });

  it("clears them when there is no session, so Angular stops showing a stale sign-in", () => {
    syncLegacySession(user);
    syncLegacySession(null);
    for (const key of ["currentUser", "userName", "level", "email"]) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it("does not throw when storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => syncLegacySession(user)).not.toThrow();
    expect(() => syncLegacySession(null)).not.toThrow();
  });
});
