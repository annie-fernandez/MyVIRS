"use client";

import { ActionIcon, Anchor, Group, Text } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { FOOTER_LINKS } from "./footer-links";
import classes from "./site-shell.module.css";
import { SOCIAL_LINKS } from "./social-links";

/** The footer band: copyright, the footer links and the social buttons. */
export function FooterContent() {
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
