/** Words in a passage, counted by spaces (the server counts them properly when it analyzes). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
