import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/landing/marketing-page";
import { PageSeo } from "@/components/seo/page-seo";
import { Button } from "@/components/ui/button";
import { pageKeywords } from "@/lib/seo/keywords";
import { aboutPageJsonLd } from "@/lib/seo/json-ld-schemas";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "About";
const description =
  "Revel is an AI product strategist by BlindspotLab, helping founders and teams reveal hidden gaps and ship better products faster.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/about",
  keywords: pageKeywords.about,
});

export default function AboutPage() {
  const { organization, name, tagline } = siteConfig;

  return (
    <MarketingPage>
      <PageSeo
        title={title}
        description={description}
        path="/about"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path: "/about" },
        ]}
        extraSchemas={[aboutPageJsonLd()]}
      />
      <article className="mx-auto max-w-3xl px-6 py-32">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {organization.name}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold md:text-5xl">
          We built {name} to reveal what others miss.
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-muted">{tagline}</p>

        <div className="mt-12 space-y-6 text-lg leading-relaxed text-muted">
          <p>
            {name} is an AI product strategist for founders, product managers,
            indie hackers, agencies, and growth teams. It reviews your website
            the way an experienced strategist would: positioning, UX, messaging,
            and competition. It then turns findings into a prioritized roadmap you
            can export and ship.
          </p>
          <p>
            Most teams are too close to their own products. They miss confusing
            messaging, weak onboarding, UX friction, and missed opportunities.
            Traditional audit tools produce long reports. Generic AI gives generic
            advice. Neither tells you what actually matters next.
          </p>
          <p>
            {name} surfaces blindspots, scores product health with the Reveal
            Index™, and generates a Blueprint™ plus Action Queue™ your team can
            implement this week, not someday.
          </p>
        </div>

        <section className="mt-16 rounded-2xl border border-border bg-surface p-8">
          <h2 className="font-heading text-2xl font-semibold">The mission</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Make world-class product strategy accessible to every builder.
            {organization.name} exists so teams ship with clarity, not guesswork.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold">Built by</h2>
          <p className="mt-4 text-muted">
            <strong className="text-foreground">{organization.name}</strong>.
            {" "}
            {organization.slogan}
          </p>
          <p className="mt-4 text-muted">
            Founded by{" "}
            <a
              href={siteConfig.founder.url}
              className="font-medium text-foreground hover:text-primary"
              rel="me"
            >
              {siteConfig.founder.name}
            </a>
            , {siteConfig.founder.jobTitle}. Alumnus of{" "}
            {siteConfig.founder.alumniOf}.
          </p>
          <p className="mt-2 text-muted">
            <a
              href={`mailto:${organization.email}`}
              className="text-primary hover:underline"
            >
              {organization.email}
            </a>
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/mission-control">Run Revel</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/docs/how-it-works">How it works</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </article>
    </MarketingPage>
  );
}