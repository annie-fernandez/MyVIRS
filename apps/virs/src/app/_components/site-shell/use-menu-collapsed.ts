"use client";

import { useLocalStorage } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { COLLAPSED_MENU_PATHS } from "./collapsed-menu-paths";

/**
 * Whether the side menu shows icons only (from tablet width up), and a toggle. Pages in
 * COLLAPSED_MENU_PATHS open collapsed; everywhere else the visitor's own choice is remembered.
 */
export function useMenuCollapsed(): [collapsed: boolean, toggle: () => void] {
  const pathname = usePathname();
  const [preferCollapsed, setPreferCollapsed] = useLocalStorage({ key: "virs:menu-collapsed", defaultValue: false });
  const [expandedHere, setExpandedHere] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  // A page that collapses the menu does so each time it opens: forget "expanded" when the page
  // changes. Adjusting state during render is React's pattern for this; no effect needed.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setExpandedHere(false);
  }

  const collapsesHere = COLLAPSED_MENU_PATHS.has(pathname);
  const collapsed = collapsesHere ? !expandedHere : preferCollapsed;
  function toggle() {
    if (collapsesHere) setExpandedHere(!expandedHere);
    else setPreferCollapsed(!preferCollapsed);
  }
  return [collapsed, toggle];
}
