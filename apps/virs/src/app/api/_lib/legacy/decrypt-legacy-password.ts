import "server-only";
import { createDecipheriv } from "node:crypto";

// The Angular app AES-encrypts passwords in the browser with this hardcoded key before
// sending them. It is not a security boundary (the key ships in the JS bundle); the server
// just reverses it and hands the plain password to Better Auth, which hashes it.
const LEGACY_AES_KEY = Buffer.from("7061737323313233", "utf8");

/** The plain password the Angular UI sent, or undefined when it can't be decrypted. */
export function decryptLegacyPassword(ciphertext: unknown): string | undefined {
  if (typeof ciphertext !== "string" || !ciphertext) return undefined;
  try {
    const decipher = createDecipheriv("aes-128-cbc", LEGACY_AES_KEY, LEGACY_AES_KEY);
    const plain = Buffer.concat([decipher.update(ciphertext, "base64"), decipher.final()]).toString("utf8");
    return plain || undefined;
  } catch {
    return undefined;
  }
}
