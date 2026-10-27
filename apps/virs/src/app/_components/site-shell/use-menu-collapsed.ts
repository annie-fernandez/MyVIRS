"use client";

import { useLocalStorage } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { COLLAPSED_MENU_PATHS } from "./collapsed-menu-paths";
import { SAME_MENU_PATHS } from "./same-menu-paths";

/**
 * Whether the side menu shows icons only (from tablet width up), and a toggle. Pages in
 * COLLAPSED_MENU_PATHS open collapsed, moving between SAME_MENU_PATHS keeps the menu as it was, and
 * everywhere else the visitor's own choice is remembered.
 */
export function useMenuCollapsed(): [collapsed: boolean, toggle: () => void] {
  const pathname = usePathname();
  const [preferCollapsed, setPreferCollapsed] = useLocalStorage({ key: "virs:menu-collapsed", defaultValue: false });
  // This page's own state, when it doesn't follow the remembered choice; null when it does.
  const [here, setHere] = useState<boolean | null>(COLLAPSED_MENU_PATHS.has(pathname) ? true : null);
  const [lastPath, setLastPath] = useState(pathname);
  // Worked out again each time the page changes. Adjusting state during render is React's pattern
  // for this; no effect needed.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (SAME_MENU_PATHS.has(lastPath) && SAME_MENU_PATHS.has(pathname)) setHere(here ?? preferCollapsed);
    else setHere(COLLAPSED_MENU_PATHS.has(pathname) ? true : null);
  }

  const collapsed = here ?? preferCollapsed;
  function toggle() {
    if (here !== null) setHere(!here);
    else setPreferCollapsed(!preferCollapsed);
  }
  return [collapsed, toggle];
}
