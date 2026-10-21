/** Whether the bytes start with any of the signatures. */
export function matchesAny(bytes: Uint8Array, signatures: number[][]): boolean {
  return signatures.some((signature) => signature.every((byte, i) => bytes[i] === byte));
}
