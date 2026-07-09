import Link from "next/link";
import { cn } from "@/lib/utils";

type DocsRelatedLinksProps = {
  links: Array<{ href: string; label: string }>;
  className?: string;
};

export function DocsRelatedLinks({ links, className }: DocsRelatedLinksProps) {
  return (
    <aside className={cn("border-t border-border pt-8", className)}>
      <p className="text-sm font-medium text-foreground">Related</p>
      <ul className="mt-3 flex flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-primary hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}