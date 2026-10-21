/** A share as a percentage with one decimal: 0.1234 → "12.3%". */
export function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}
