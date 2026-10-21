import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import { MANTINE_PATHS } from "./mantine-paths";

type ShellLinkProps = ComponentPropsWithRef<"a"> & { href: string };

/**
 * A link that navigates correctly from a Mantine page: client-side to another Mantine page, and a
 * full page load to an Angular screen, since Angular's router only runs inside its own bundle.
 * Pass it to Mantine components as `component={ShellLink}`.
 */
export function ShellLink({ href, ...props }: ShellLinkProps) {
  if (MANTINE_PATHS.has(href)) return <Link href={href as Route} {...props} />;
  return <a href={href} {...props} />;
}
