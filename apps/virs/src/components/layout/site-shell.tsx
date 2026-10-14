"use client";

import { ActionIcon, Anchor, AppShell, Burger, Group, NavLink, Text, Tooltip } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconBrandFacebook, IconBrandInstagram, IconCheck, IconQuote } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AccountMenu } from "./account-menu";
import { CITATION, FOOTER_LINKS, NAV_SECTIONS, SOCIAL_LINKS } from "./nav";
import { ShellLink } from "./shell-link";
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

const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 48;
const NAVBAR_WIDTH = 220;

function FooterContent() {
  return (
    <>
      <Text size="sm" inherit>
        © 2017 Vocabulary in Reading Study
      </Text>
      <Group gap="md" component="nav" aria-label="Footer">
        {FOOTER_LINKS.map((link) => (
          <Anchor key={link.href} component={ShellLink} href={link.href} size="sm" className={classes.footerLink}>
            {link.label}
          </Anchor>
        ))}
        <Anchor href={SOCIAL_LINKS.donate} target="_blank" rel="noopener noreferrer" size="sm" className={classes.footerLink}>
          Donate
        </Anchor>
      </Group>
      <Group gap={4}>
        <ActionIcon component="a" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className={classes.frameButton} aria-label="VIRS on Instagram">
          <IconBrandInstagram size={16} />
        </ActionIcon>
        <ActionIcon component="a" href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className={classes.frameButton} aria-label="VIRS on Facebook">
          <IconBrandFacebook size={16} />
        </ActionIcon>
      </Group>
    </>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const currentPath = NAV_PARENT[pathname] ?? pathname;
  const clipboard = useClipboard({ timeout: 2000 });

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      footer={{ height: { base: 0, sm: FOOTER_HEIGHT } }}
      navbar={{ width: NAVBAR_WIDTH, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
      withBorder={false}
    >
      <AppShell.Header className={classes.header}>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
          className={classes.burger}
          aria-label={opened ? "Close menu" : "Open menu"}
        />
        <a href="/dashboard" className={classes.brand}>
          <span className={classes.title}>
            <Text span inherit visibleFrom="sm">
              Vocabulary in Reading Study
            </Text>
            <Text span inherit hiddenFrom="sm">
              VIRS
            </Text>
          </span>
        </a>
        <div className={classes.headerActions}>
          <Tooltip label={clipboard.copied ? "Citation copied" : "Copy our citation"} withArrow>
            <ActionIcon
              size={32}
              radius="md"
              variant="transparent"
              color="charcoal"
              className={classes.frameButton}
              onClick={() => clipboard.copy(CITATION)}
              aria-label="Copy citation"
            >
              {clipboard.copied ? <IconCheck size={18} /> : <IconQuote size={18} />}
            </ActionIcon>
          </Tooltip>
          {/* AccountMenu reads the URL (?login=1), which needs a Suspense boundary on static pages. */}
          <Suspense>
            <AccountMenu buttonClassName={classes.frameButton} />
          </Suspense>
        </div>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar}>
        <nav aria-label="Main">
          {NAV_SECTIONS.map((section, index) => (
            <div key={section.label ?? index}>
              {section.label && <div className={classes.sectionLabel}>{section.label}</div>}
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  component={ShellLink}
                  href={item.href}
                  label={item.label}
                  leftSection={<item.icon size={18} stroke={1.8} />}
                  active={currentPath === item.href}
                  className={classes.navLink}
                  onClick={close}
                />
              ))}
            </div>
          ))}
        </nav>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <div className={classes.content}>{children}</div>
        {/* Phones: the footer ends the page instead of staying on screen. */}
        <footer className={classes.pageFooter}>
          <FooterContent />
        </footer>
      </AppShell.Main>

      {/* From tablets up: one band along the whole bottom of the window, under the sidebar too. */}
      <AppShell.Footer component="footer" className={classes.footer} visibleFrom="sm">
        <FooterContent />
      </AppShell.Footer>
    </AppShell>
  );
}
