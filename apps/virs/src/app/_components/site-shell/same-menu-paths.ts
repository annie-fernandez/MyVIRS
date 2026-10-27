/**
 * Pages that leave the side menu as it is when moving between them: the three results, so switching
 * tabs doesn't open and close it. Arriving from any other page, each starts as it normally would.
 */
export const SAME_MENU_PATHS = new Set<string>(["/enhanced-text-result", "/text-statistics", "/context-words"]);
