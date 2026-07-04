import Link from "next/link";
import type { ComponentProps } from "react";
import { resolveNavHref } from "@/lib/navigation";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function NavLink({ href, children, ...props }: NavLinkProps) {
  const { href: resolvedHref, useAnchor } = resolveNavHref(href);

  if (useAnchor) {
    const { prefetch: _prefetch, replace: _replace, scroll, ...anchorProps } =
      props;
    return (
      <a href={resolvedHref} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <Link href={resolvedHref} {...props}>
      {children}
    </Link>
  );
}