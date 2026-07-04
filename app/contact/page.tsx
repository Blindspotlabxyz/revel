import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { pageKeywords } from "@/lib/seo/keywords";
import { contactPageJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Contact";
const description =
  "Contact Revel and BlindspotLab — general inquiries, support, and partnerships.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/contact",
  keywords: pageKeywords.contact,
});

export default function ContactPage() {
  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/contact"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/contact" },
        ]}
        extraSchemas={[contactPageJsonLd()]}
      />
      <div className="mx-auto max-w-2xl px-6 py-32">
        <h1 className="font-heading text-4xl font-semibold">Contact</h1>
        <p className="mt-4 text-lg text-muted">
          We&apos;d love to hear from you.
        </p>

        <div className="mt-12 space-y-4">
          <Card>
            <CardContent className="pt-0">
              <CardTitle>General inquiries</CardTitle>
              <p className="mt-2 text-muted">
                <a
                  href={`mailto:${siteConfig.organization.email}`}
                  className="text-primary hover:underline"
                >
                  {siteConfig.organization.email}
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-0">
              <CardTitle>Support</CardTitle>
              <p className="mt-2 text-muted">
                <a
                  href="mailto:support@blindspotlab.xyz"
                  className="text-primary hover:underline"
                >
                  support@blindspotlab.xyz
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-0">
              <CardTitle>Built by</CardTitle>
              <p className="mt-2 text-muted">{siteConfig.organization.name}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingPage>
  );
}