"use client";

import { AppShell, Burger, NavLink, ScrollArea, Tooltip } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { AccountMenu } from "./account-menu/account-menu";
import { CitationButton } from "./citation-button";
import { NAV_SECTIONS } from "./nav-sections";
import classes from "./site-shell.module.css";

// Screens reached from a sidebar entry that should stay marked there.
const NAV_PARENT: Record<string, string> = {
  "/": "/dashboard",
  "/doc": "/text",
  "/pdf": "/text",
  "/image": "/text",
  "/enhanced-text-result": "/text",
  "/text-statistics": "/text",
  "/context-words": "/text",
};

/**
 * The blue side menu: the site name, every destination, and at the bottom the citation and the
 * account. The same menu opens from the burger on phones. From tablet width up it can collapse to
 * icons (labels then show as tooltips).
 */
export function SideMenu({ collapsed, onToggle, onNavigate }: { collapsed: boolean; onToggle: () => void; onNavigate: () => void }) {
  const pathname = usePathname();
  // The item clicked last is highlighted at once, as in Mantine's navbar examples, instead of
  // after the new page has loaded. It hands back to the address once the page changes.
  const [clickedHref, setClickedHref] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setClickedHref(null);
  }
  const currentPath = clickedHref ?? NAV_PARENT[pathname] ?? pathname;
  const toggleLabel = collapsed ? "Show the menu" : "Collapse the menu";

  return (
    <AppShell.Navbar className={classes.navbar} data-collapsed={collapsed || undefined}>
      {/* Phones show the site name in the bar above, and the menu never collapses there. */}
      <AppShell.Section className={classes.menuTop} visibleFrom="sm">
        {/* Mantine's collapsible-navbar pattern: a Burger before the site name, as on the phone bar.
            Collapsed, only the Burger shows (the site name is a label, hidden then). */}
        <Burger opened={!collapsed} onClick={onToggle} size="sm" className={classes.burger} aria-label={toggleLabel} aria-expanded={!collapsed} />
        <ShellLink href="/dashboard" className={`${classes.brand} ${classes.label}`} aria-label="VIRS, Vocabulary in Reading Study: home">
          <span className={classes.brandMark}>VIRS</span>
          <span className={classes.brandName}>Vocabulary in Reading Study</span>
        </ShellLink>
      </AppShell.Section>

      {/* Up and down only: collapsed, the hidden labels are wider than the menu and would add a sideways scrollbar. */}
      <AppShell.Section grow component={ScrollArea} scrollbars="y" className={classes.menuLinks}>
        <nav aria-label="Main">
          {NAV_SECTIONS.map((section, index) => (
            <div key={section.label ?? index}>
              {section.label && <div className={classes.sectionLabel}>{section.label}</div>}
              {section.items.map((item) => (
                <Tooltip key={item.href} label={item.label} position="right" disabled={!collapsed}>
                  <NavLink
                    component={ShellLink}
                    href={item.href}
                    label={item.label}
                    aria-label={item.label}
                    leftSection={<item.icon size={18} stroke={1.8} />}
                    active={currentPath === item.href}
                    classNames={{ root: classes.navLink, body: classes.label, section: classes.navIcon }}
                    onClick={() => {
                      // Unchanged page (clicking the current item): nothing to wait for.
                      if (item.href !== (NAV_PARENT[pathname] ?? pathname)) setClickedHref(item.href);
                      onNavigate();
                    }}
                  />
                </Tooltip>
              ))}
            </div>
          ))}
        </nav>
      </AppShell.Section>

      <AppShell.Section className={classes.menuBottom}>
        <CitationButton collapsed={collapsed} />
        <AccountMenu collapsed={collapsed} />
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
