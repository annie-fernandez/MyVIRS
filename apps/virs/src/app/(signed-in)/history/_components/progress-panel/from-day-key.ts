/** Day keys are local dates (YYYY-MM-DD); parse them as local midnight, not UTC. */
export function fromDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}
