"use client";

import {
  AppShell,
  Burger,
  Button,
  CopyButton,
  Divider,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAbc,
  IconBook2,
  IconChartPie,
  IconCheck,
  IconDownload,
  IconFileText,
  IconFileTypePdf,
  IconHome,
  IconKeyboard,
  IconLanguage,
  IconListSearch,
  IconPhoto,
  IconQuote,
  IconSettings,
} from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { ColorSchemeToggle } from "./color-scheme-toggle";
import { UserMenu } from "./user-menu";

const CITATION = "Ehsanzadeh, S.J. & Dwyer, E. (2017). A Corpus-based K-12 School Dictionary.";

interface NavItem {
  label: string;
  href: Route;
  icon: typeof IconHome;
}

const ANALYZE_ITEMS: NavItem[] = [
  { label: "Text", href: "/analyze/text", icon: IconKeyboard },
  { label: "Word document", href: "/analyze/document", icon: IconFileText },
  { label: "PDF", href: "/analyze/pdf", icon: IconFileTypePdf },
  { label: "Image", href: "/analyze/image", icon: IconPhoto },
];

const WORD_ITEMS: NavItem[] = [
  { label: "Search words", href: "/words", icon: IconListSearch },
  { label: "Download lists", href: "/words/download", icon: IconDownload },
];

function NavItemLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      component={Link}
      href={item.href}
      label={item.label}
      active={active}
      leftSection={<Icon size={18} stroke={1.6} />}
    />
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  // Close the mobile navbar after navigating.
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <UnstyledButton component={Link} href="/">
              <Group gap={8} wrap="nowrap">
                <IconBook2 size={26} color="var(--mantine-primary-color-filled)" />
                <Title order={4} visibleFrom="xs">
                  Vocabulary in Reading Study
                </Title>
                <Title order={4} hiddenFrom="xs">
                  VIRS
                </Title>
              </Group>
            </UnstyledButton>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <ColorSchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppShell.Section grow component={ScrollArea}>
          <NavItemLink item={{ label: "Home", href: "/", icon: IconHome }} active={pathname === "/"} />
          <NavLink
            label="Analyze your text"
            leftSection={<IconAbc size={18} stroke={1.6} />}
            defaultOpened
            childrenOffset={28}
          >
            {ANALYZE_ITEMS.map((item) => (
              <NavItemLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </NavLink>
          <NavItemLink
            item={{ label: "Results", href: "/results", icon: IconChartPie }}
            active={pathname === "/results"}
          />
          <Divider my="sm" label="Word lists" labelPosition="left" />
          {WORD_ITEMS.map((item) => (
            <NavItemLink key={item.href} item={item} active={pathname === item.href} />
          ))}
          <Divider my="sm" label="Tools" labelPosition="left" />
          <NavItemLink
            item={{ label: "Translate", href: "/translate", icon: IconLanguage }}
            active={pathname === "/translate"}
          />
          {session?.user.role === "admin" && (
            <NavItemLink
              item={{ label: "Manage words", href: "/admin/words", icon: IconSettings }}
              active={pathname.startsWith("/admin")}
            />
          )}
        </AppShell.Section>

        <AppShell.Section>
          <Divider mb="sm" />
          <Stack gap="xs">
            <CopyButton value={CITATION} timeout={2500}>
              {({ copied, copy }) => (
                <Tooltip label={CITATION} multiline w={260} withArrow>
                  <Button
                    variant="light"
                    color={copied ? "teal" : undefined}
                    leftSection={copied ? <IconCheck size={16} /> : <IconQuote size={16} />}
                    onClick={copy}
                    fullWidth
                  >
                    {copied ? "Citation copied" : "Cite us"}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>
            <Group gap="md" justify="center">
              <Text component={Link} href="/references" size="xs" c="dimmed">
                References
              </Text>
              <Text component={Link} href="/contact" size="xs" c="dimmed">
                Contact
              </Text>
              <Text
                component="a"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CGR2652V3TZHL"
                target="_blank"
                rel="noreferrer"
                size="xs"
                c="dimmed"
              >
                Donate
              </Text>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              © {new Date().getFullYear()} Vocabulary in Reading Study
            </Text>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
