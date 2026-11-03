import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithRef } from "react";

type ShellLinkProps = ComponentPropsWithRef<"a"> & { href: string };

/**
 * A Next.js link that Mantine components can take as `component={ShellLink}`.
 */
export function ShellLink({ href, ...props }: ShellLinkProps) {
  return <Link href={href as Route} {...props} />;
}
