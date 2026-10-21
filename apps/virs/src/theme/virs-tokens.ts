/** Surface, border and layout values shared by the shell and every screen. Also exposed as CSS variables. */
export const VIRS_TOKENS = {
  /** The light neutral gray behind page content, so white cards read as sheets of paper on a desk. */
  page: "#f1f2f5",
  /** Cards, inputs, sidebar and footer: paper white. */
  surface: "#ffffff",
  /** Hairlines between surfaces. */
  border: "#d9dce3",
  /** Body text: ink, nearly black. */
  text: "#17191e",
  /** Secondary text people still need to read (Mantine's default "dimmed" is too faint). */
  textMuted: "#555a64",
  /** The side menu (and the bar above it on phones): the site's indigo, one shade deeper than the buttons. The only solid block of color. */
  menu: "#313e89",
  /** Text and icons on the side menu; also the fill of its current page, whose text is then `menu`. */
  onMenu: "#ffffff",
  /** Quieter text on the side menu: section labels and resting icons. */
  menuMuted: "rgba(255, 255, 255, 0.72)",
  /** The hover fill of links and buttons on the side menu. */
  menuHover: "rgba(255, 255, 255, 0.12)",
  /** The footer. */
  frame: "#ffffff",
  /** Text and icons on the footer. */
  frameText: "#17191e",
  /** Quieter text there: footer links, resting icons. */
  frameMuted: "#555a64",
  /** The hover fill of links and buttons on the footer. */
  frameBorder: "rgba(23, 25, 30, 0.06)",
  /** Highlighter-pen yellow behind a key word in a page title. */
  marker: "rgba(255, 214, 0, 0.6)",
} as const;
