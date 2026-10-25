import { IconArrowDown, IconHighlight, IconHistory, IconHome, IconLanguage, IconSearch, type Icon } from "@tabler/icons-react";

// The links in this folder are one map of URL → label for the whole site.

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
