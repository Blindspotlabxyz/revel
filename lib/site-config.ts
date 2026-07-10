/** Ensures env URLs work with `new URL()`. Accepts `tryrevel.xyz` or `https://tryrevel.xyz`. */
export function normalizeSiteUrl(
  value: string | undefined,
  fallback: string
): string {
  const raw = (value?.trim() || fallback).replace(/\/$/, "");
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

export const siteConfig = {
  name: "Revel",
  tagline: "Find the hidden gaps stopping your product from growing",
  description:
    "Revel analyzes your website, product experience, messaging and competitors, then generates a prioritized roadmap your team can implement.",
  /**
   * Marketing apex (logo home). Prefer NEXT_PUBLIC_MARKETING_URL so docs/legal
   * deployments can pin home without coupling to a product subdomain APP_URL.
   */
  marketingUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_MARKETING_URL ?? process.env.NEXT_PUBLIC_APP_URL,
    "https://tryrevel.xyz"
  ),
  url: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_APP_URL,
    "https://tryrevel.xyz"
  ),
  docsUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_DOCS_URL,
    "https://docs.tryrevel.xyz"
  ),
  legalUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_LEGAL_URL,
    "https://legal.tryrevel.xyz"
  ),
  authUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_AUTH_URL,
    "https://auth.tryrevel.xyz"
  ),
  organization: {
    name: "BlindspotLab",
    legalName: "BlindspotLab",
    url: "https://blindspotlab.xyz",
    email: "hello@mail.tryrevel.xyz",
    slogan: "Reveal what others miss.",
  },
  founder: {
    name: "Mojeeb Titilayo",
    jobTitle: "AI Product Engineer & Founder",
    url: "https://mojeeb.xyz",
    alumniOf: "University of Ilorin",
    sameAs: ["https://x.com/tmojeeb", "https://mojeeb.xyz"],
    credentials: [
      {
        name: "Anthropic Academy Certified (Claude)",
        recognizedBy: "Anthropic",
      },
      {
        name: "Google Developer",
        recognizedBy: "Google",
      },
    ],
  },
  product: {
    category: "BusinessApplication",
    applicationCategory: "ProductivityApplication",
  },
} as const;

export function subdomainRedirectsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_REDIRECTS === "true";
}

export function founderJsonLd(id?: string) {
  const { founder, organization } = siteConfig;

  return {
    "@type": "Person",
    ...(id ? { "@id": id } : {}),
    name: founder.name,
    jobTitle: founder.jobTitle,
    url: founder.url,
    worksFor: { "@type": "Organization", name: organization.name },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: founder.alumniOf,
    },
    hasCredential: founder.credentials.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: credential.name,
      recognizedBy: {
        "@type": "Organization",
        name: credential.recognizedBy,
      },
    })),
    sameAs: founder.sameAs,
  };
}

export function organizationJsonLd(id?: string) {
  const { organization, url } = siteConfig;

  return {
    "@type": "Organization",
    ...(id ? { "@id": id } : {}),
    name: organization.name,
    legalName: organization.legalName,
    url: organization.url,
    email: organization.email,
    slogan: organization.slogan,
    logo: `${url}/android-chrome-512x512.png`,
    founder: founderJsonLd(),
  };
}