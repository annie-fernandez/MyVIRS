import { IconFileText, IconFileTypePdf, IconKeyboard, IconPhoto, type Icon } from "@tabler/icons-react";
import type { VirsColor } from "@/theme";

export interface TextSource {
  /** Where the screen for this source lives. */
  href: string;
  color: VirsColor;
  icon: Icon;
  title: string;
  description: string;
  /** Shorter wording for compact cards, where three or four sit side by side. */
  short: { title: string; description: string };
}

// The four ways to bring a text in, each in the color it had on the old home screen. Every screen
// that offers these choices uses this list, so their order, colors and wording stay the same.
export const TEXT_SOURCES = {
  text: {
    href: "/text",
    color: "virsIndigo",
    icon: IconKeyboard,
    title: "Type or paste text",
    description: "Up to 30,000 characters",
    short: { title: "Text", description: "Type or paste" },
  },
  doc: {
    href: "/doc",
    color: "virsCyan",
    icon: IconFileText,
    title: "Upload a Word document",
    description: ".doc or .docx",
    short: { title: "Word document", description: ".doc or .docx" },
  },
  pdf: {
    href: "/pdf",
    color: "virsGreen",
    icon: IconFileTypePdf,
    title: "Upload a PDF",
    description: "PDFs with selectable text",
    short: { title: "PDF", description: "With selectable text" },
  },
  image: {
    href: "/image",
    color: "virsPink",
    icon: IconPhoto,
    title: "Upload a photo",
    description: "A picture of a page, JPEG or PNG",
    short: { title: "Photo", description: "JPEG or PNG" },
  },
} satisfies Record<string, TextSource>;
