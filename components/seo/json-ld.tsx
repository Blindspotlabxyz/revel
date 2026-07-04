import {
  founderJsonLd,
  organizationJsonLd,
  siteConfig,
} from "@/lib/site-config";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function GlobalJsonLd() {
  const { name, description, url, tagline } = siteConfig;
  const orgId = `${url}/#organization`;
  const founderId = `${url}/#founder`;

  const graph = [
    {
      ...organizationJsonLd(orgId),
      founder: { ...founderJsonLd(founderId), worksFor: { "@id": orgId } },
    },
    {
      ...founderJsonLd(founderId),
      worksFor: { "@id": orgId },
    },
    {
      "@type": "WebSite",
      "@id": `${url}/#website`,
      name,
      description,
      url,
      publisher: { "@id": orgId },
      inLanguage: "en",
      about: { "@id": `${url}/#product` },
      keywords: tagline,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${url}/#product`,
      name,
      description: tagline,
      url,
      applicationCategory: siteConfig.product.applicationCategory,
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free starter tier available",
      },
      creator: { "@id": orgId },
      publisher: { "@id": orgId },
      author: { "@id": founderId },
    },
  ];

  return (
    <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
  );
}