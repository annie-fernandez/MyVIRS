/** A short date without the year, e.g. "Oct 18". */
export function shortDate(value: string | Date): string {
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}
