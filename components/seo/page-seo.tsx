import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/json-ld-schemas";

type PageSeoProps = {
  title: string;
  description: string;
  path: string;
  breadcrumbs?: { name: string; path: string }[];
  extraSchemas?: Record<string, unknown>[];
};

export function PageSeo({
  title,
  description,
  path,
  breadcrumbs,
  extraSchemas = [],
}: PageSeoProps) {
  const schemas: Record<string, unknown>[] = [
    webPageJsonLd({ title, description, path }),
    ...extraSchemas,
  ];

  if (breadcrumbs?.length) {
    schemas.push(breadcrumbJsonLd(breadcrumbs));
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
    </>
  );
}