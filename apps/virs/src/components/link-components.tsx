"use client";

// Server Components cannot pass `component={Link}` (a function) to Mantine's client components,
// so these thin wrappers do it on the client side.
import { Button, Card, type ButtonProps, type CardProps } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({ href, children, ...props }: ButtonProps & { href: Route; children: ReactNode }) {
  return (
    <Button component={Link} href={href} {...props}>
      {children}
    </Button>
  );
}

export function CardLink({ href, children, ...props }: CardProps & { href: Route; children: ReactNode }) {
  return (
    <Card component={Link} href={href} {...props}>
      {children}
    </Card>
  );
}
