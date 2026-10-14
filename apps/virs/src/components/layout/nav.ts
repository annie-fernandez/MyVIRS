import { IconArrowDown, IconHighlight, IconHistory, IconHome, IconLanguage, IconSearch, type Icon } from "@tabler/icons-react";

// One map of URL → label for the whole site, so the Mantine shell and the Angular screens send
// people to the same places while both are live. The URLs are the Angular ones.

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/dashboard", icon: IconHome },
      // One entry for all four ways to add text; the screen itself switches between them.
      { label: "Analyze", href: "/text", icon: IconHighlight },
      { label: "History", href: "/history", icon: IconHistory },
    ],
  },
  {
    label: "Word lists",
    items: [
      { label: "Search words", href: "/search-words", icon: IconSearch },
      { label: "Download lists", href: "/download-words", icon: IconArrowDown },
    ],
  },
  { label: "Tools", items: [{ label: "iTranslate", href: "/itranslate", icon: IconLanguage }] },
];

/** Angular screens reached from the account menu. */
export const ACCOUNT_LINKS = {
  register: "/register",
  profile: "/account",
  changePassword: "/change-password",
} as const;

export const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Contact us", href: "/contact-us" },
  { label: "Reference", href: "/credits" },
  { label: "Admin", href: "/admin" },
];

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/my_virs/?hl=en",
  facebook: "https://www.facebook.com/VocabularyInReadingStudy",
  donate: "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CGR2652V3TZHL",
} as const;

export const CITATION = "Ehsanzadeh, S.J. & Dwyer, E. (2017). A Corpus-based K-12 School Dictionary.";

/**
 * URLs already served by Mantine pages. Links to these use client-side navigation; every other
 * URL is an Angular screen and needs a full page load. Add a path here when its screen moves over.
 */
export const MANTINE_PATHS = new Set<string>([
  "/",
  "/dashboard",
  "/text",
  "/doc",
  "/pdf",
  "/image",
  "/enhanced-text-result",
  "/text-statistics",
  "/search-words",
  "/download-words",
  "/itranslate",
  "/contact-us",
  "/credits",
  "/register",
  "/account",
  "/history",
  "/change-password",
  "/restore",
  "/admin",
  "/style-guide",
]);
