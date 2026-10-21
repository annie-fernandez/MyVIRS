"use client";

import { ActionIcon, AppShell, NavLink, ScrollArea, Tooltip } from "@mantine/core";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
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
};

/**
 * The blue side menu: the site name, every destination, and at the bottom the citation and the
 * account. The same menu opens from the burger on phones. From tablet width up it can collapse to
 * icons (labels then show as tooltips).
 */
export function SideMenu({ collapsed, onToggle, onNavigate }: { collapsed: boolean; onToggle: () => void; onNavigate: () => void }) {
  const pathname = usePathname();
  const currentPath = NAV_PARENT[pathname] ?? pathname;

  return (
    <AppShell.Navbar className={classes.navbar} data-collapsed={collapsed || undefined}>
      {/* Phones show the site name in the bar above, and the menu never collapses there. */}
      <AppShell.Section className={classes.menuTop} visibleFrom="sm">
        <a href="/dashboard" className={`${classes.brand} ${classes.label}`}>
          Vocabulary in Reading Study
        </a>
        <Tooltip label={collapsed ? "Show the menu" : "Collapse the menu"} position="right">
          <ActionIcon variant="transparent" className={classes.menuButton} onClick={onToggle} aria-label={collapsed ? "Show the menu" : "Collapse the menu"} aria-expanded={!collapsed}>
            {collapsed ? <IconLayoutSidebarLeftExpand size={20} stroke={1.8} /> : <IconLayoutSidebarLeftCollapse size={20} stroke={1.8} />}
          </ActionIcon>
        </Tooltip>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea} className={classes.menuLinks}>
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
                    onClick={onNavigate}
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
