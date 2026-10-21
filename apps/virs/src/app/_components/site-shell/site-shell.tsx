"use client";

import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { ReactNode } from "react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { FooterContent } from "./footer-content";
import { SideMenu } from "./side-menu";
import classes from "./site-shell.module.css";
import { useMenuCollapsed } from "./use-menu-collapsed";

const PHONE_BAR_HEIGHT = 56;
const FOOTER_HEIGHT = 48;
const MENU_WIDTH = 256;
// 10px menu padding + 10px item padding either side of an 18px icon: the icons stay put when it collapses.
const COLLAPSED_MENU_WIDTH = 58;

/** The side menu and footer around every Mantine screen; on phones, a bar with the menu button too. */
export function SiteShell({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [collapsed, toggleCollapsed] = useMenuCollapsed();

  return (
    <AppShell
      layout="alt"
      header={{ height: { base: PHONE_BAR_HEIGHT, sm: 0 } }}
      footer={{ height: { base: 0, sm: FOOTER_HEIGHT } }}
      navbar={{ width: collapsed ? COLLAPSED_MENU_WIDTH : MENU_WIDTH, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
      withBorder={false}
    >
      {/* The first thing Tab reaches: keyboard users can jump past the menu straight to the page. */}
      <a href="#main-content" className={classes.skipLink}>
        Skip to main content
      </a>

      {/* Phones only: the side menu is hidden behind the burger. */}
      <AppShell.Header className={classes.phoneBar} hiddenFrom="sm">
        <Burger opened={opened} onClick={toggle} size="sm" className={classes.burger} aria-label={opened ? "Close menu" : "Open menu"} />
<ShellLink href="/dashboard" className={classes.brand} aria-label="VIRS, Vocabulary in Reading Study: home">
          <span className={classes.brandMark}>VIRS</span>
          <span className={classes.brandName}>Vocabulary in Reading Study</span>
        </ShellLink>
      </AppShell.Header>

      <SideMenu collapsed={collapsed} onToggle={toggleCollapsed} onNavigate={close} />

      {/* tabIndex -1 lets the skip link move focus here, not just scroll. */}
      <AppShell.Main id="main-content" tabIndex={-1} className={classes.main}>
        <div className={classes.content}>{children}</div>
        {/* Phones: the footer ends the page instead of staying on screen. */}
        <footer className={classes.pageFooter}>
          <FooterContent />
        </footer>
      </AppShell.Main>

      {/* From tablets up: one band along the bottom of the window, beside the side menu. */}
      <AppShell.Footer component="footer" className={classes.footer} visibleFrom="sm">
        <FooterContent />
      </AppShell.Footer>
    </AppShell>
  );
}
