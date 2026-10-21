/** A date with its year, e.g. "Oct 18, 2026". */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
