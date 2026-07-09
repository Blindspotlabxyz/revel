import Link from "next/link";
import { DocsRelatedLinks } from "@/components/docs/docs-related-links";

type DocsArticleProps = {
  title: string;
  description: string;
  path: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
  related?: Array<{ href: string; label: string }>;
  children: React.ReactNode;
};

export function DocsArticle({
  title,
  description,
  path,
  breadcrumbs,
  related,
  children,
}: DocsArticleProps) {
  const crumbs = breadcrumbs ?? [
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
  ];

  return (
    <article className="mx-auto max-w-2xl px-6 py-32">
      <p className="text-sm text-muted">
        <Link href="/docs" className="hover:text-foreground">
          ← Documentation
        </Link>
      </p>

      <nav className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        {crumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-2">
            {i > 0 ? <span>/</span> : null}
            <Link href={crumb.path} className="hover:text-foreground">
              {crumb.name}
            </Link>
          </span>
        ))}
      </nav>

      <h1 className="mt-6 font-heading text-4xl font-semibold">{title}</h1>
      <p className="mt-4 text-lg text-muted">{description}</p>

      <div className="docs-prose mt-12 space-y-10 text-muted">{children}</div>

      {related?.length ? (
        <DocsRelatedLinks links={related} className="mt-16" />
      ) : null}
    </article>
  );
}

export function DocSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

export function DocCode({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-sm text-foreground">
      {children}
    </pre>
  );
}

export function DocEndpoint({
  method,
  path,
  body,
  description,
}: {
  method: string;
  path: string;
  body?: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-medium text-foreground">
        <span className="text-primary">{method}</span> {path}
      </p>
      {body ? (
        <p className="mt-1 font-mono text-xs text-muted">Body: {body}</p>
      ) : null}
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}