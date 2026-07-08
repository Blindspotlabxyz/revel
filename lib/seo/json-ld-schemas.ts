import { revelFaqs } from "@/lib/seo/faqs";
import { absoluteUrl } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: revelFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#product` },
    inLanguage: "en",
  };
}

export function howToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to run a Revel product analysis",
    description:
      "Analyze your website with Revel and receive a prioritized product roadmap in under a minute.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your website URL",
        text: "Open Mission Control and enter your public product URL.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Analyze",
        text: "Revel reviews positioning, UX, messaging, and competitors.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Reveal blindspots",
        text: "Hidden gaps surface with priority scores.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Get your Blueprint",
        text: "Receive a ranked improvement roadmap.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Export tasks",
        text: "Download Markdown or JSON for your workflow.",
      },
    ],
    tool: { "@type": "SoftwareApplication", name: siteConfig.name },
  };
}

export function productOffersJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: siteConfig.name,
    description: siteConfig.description,
    brand: { "@type": "Brand", name: siteConfig.name },
    manufacturer: { "@id": `${siteConfig.url}/#organization` },
    offers: {
      "@type": "Offer",
      name: "Early access",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/mission-control"),
    },
  };
}

export function featuresItemListJsonLd() {
  const features = [
    "Product Analysis",
    "UX Review",
    "Messaging Audit",
    "Competitor Review",
    "Reveal Index",
    "Blueprint Roadmap",
  ];

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Revel Features",
    itemListElement: features.map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
    })),
  };
}

const productFeatures = [
  "AI product and website analysis",
  "UX friction review across the user journey",
  "Messaging and positioning audit",
  "Competitor landscape review",
  "Reveal Index product health score",
  "Blueprint prioritized roadmap",
  "Action Queue with Markdown and JSON export",
  "Mission Control analysis dashboard",
] as const;

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteConfig.url}/#product`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: siteConfig.product.applicationCategory,
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    featureList: [...productFeatures],
    screenshot: absoluteUrl("/images/hero-peel-desktop-16x9.jpg"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      url: absoluteUrl("/mission-control"),
    },
    creator: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function webApiJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: "Revel API",
    description:
      "REST API to analyze products, fetch reports, export roadmaps, and list analysis history.",
    documentation: absoluteUrl("/docs/api"),
    termsOfService: absoluteUrl("/terms"),
    provider: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Revel",
    description: "Contact BlindspotLab and the Revel team.",
    url: absoluteUrl("/contact"),
    mainEntity: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Revel",
    description:
      "Revel is built by BlindspotLab to help founders find product blindspots and ship better roadmaps.",
    url: absoluteUrl("/about"),
    about: { "@id": `${siteConfig.url}/#product` },
    mainEntity: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function speakableWebPageJsonLd({
  title,
  description,
  path,
  cssSelectors = ["h1", "[data-speakable]"],
}: {
  title: string;
  description: string;
  path: string;
  cssSelectors?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}