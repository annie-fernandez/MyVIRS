/** A date and time, e.g. "Oct 18, 2026, 3:45 PM". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
