import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PageSeo } from "@/components/seo/page-seo";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-config";

const title = "Privacy Policy";
const description =
  "How Revel and BlindspotLab collect, use, and protect your data.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/privacy",
  keywords: ["privacy policy", "data protection", "Revel privacy"],
});

export default function PrivacyPage() {
  return (
    <>
      <PageSeo title={title} description={description} path="/privacy" />
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-32">
        <h1 className="font-heading text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-muted">Last updated: July 9, 2026</p>

        <div className="prose-revel mt-12 space-y-8 text-muted">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Overview
            </h2>
            <p className="mt-3 leading-relaxed">
              Revel (&quot;we&quot;, &quot;us&quot;) is operated by BlindspotLab. This policy
              explains what we collect when you use {siteConfig.url}, Mission Control,
              our Partner API, MCP endpoints, and OKX.AI marketplace integrations.
              We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              What we collect
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
              <li>
                <strong className="text-foreground">Account data:</strong> email
                address, name (if provided via Google OAuth), and authentication
                identifiers when you sign in.
              </li>
              <li>
                <strong className="text-foreground">Analysis data:</strong> website
                URLs you submit, generated reports (Reveal Index, blindspots,
                blueprint, action queue), and analysis status.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> audit
                counts, API/MCP call metadata, partner platform identifiers, and
                activity events for rate limiting and admin analytics.
              </li>
              <li>
                <strong className="text-foreground">Partner applications:</strong>{" "}
                platform name, contact email, domain, and optional notes when you
                apply for Partner API access.
              </li>
              <li>
                <strong className="text-foreground">Payment metadata:</strong> when
                you use OKX x402 billing, transaction references are processed by
                OKX — we do not store private keys or full wallet credentials.
              </li>
              <li>
                <strong className="text-foreground">Technical data:</strong> IP
                address, browser type, and request logs for security and abuse
                prevention (via hosting provider).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              How we use your data
            </h2>
            <p className="mt-3 leading-relaxed">
              We use collected data to run product audits, store your analysis
              history, enforce weekly usage limits, operate the Partner API,
              process marketplace payments, send transactional emails (account
              welcome, partner approval, API key delivery), and improve Revel.
              Public website content you submit for analysis is sent to our AI
              providers for processing and retained only as part of your report.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Partner API &amp; integrations
            </h2>
            <p className="mt-3 leading-relaxed">
              Approved partners receive API keys stored as hashed values on our
              servers. Partners may only access analysis reports they initiated
              via the Partner API. Partner platforms (e.g. Arcapush) are
              responsible for how they display Revel insights to their users and
              for securing API keys on their servers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Third-party services
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
              <li>Google OAuth &amp; NextAuth (authentication)</li>
              <li>Supabase / PostgreSQL (data storage)</li>
              <li>Groq and OpenRouter (AI analysis)</li>
              <li>OKX Onchain OS / x402 (agent marketplace payments)</li>
              <li>Resend (transactional email)</li>
              <li>Vercel (hosting)</li>
              <li>Plausible (optional, privacy-friendly analytics)</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Each provider operates under its own privacy policy. OKX ecosystem
              services are governed by OKX policies when you interact with
              marketplace billing or Onchain OS.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Data retention &amp; deletion
            </h2>
            <p className="mt-3 leading-relaxed">
              Analysis reports are retained while your account exists so you can
              access history and exports. Partner activity logs are retained for
              operational analytics. You may request account deletion by contacting
              us; we will remove personal identifiers where technically feasible.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Your rights
            </h2>
            <p className="mt-3 leading-relaxed">
              Depending on your jurisdiction, you may request access, correction,
              or deletion of personal data we hold. Contact us using the details
              below.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed">
              Questions about privacy? Email{" "}
              <a
                href={`mailto:${siteConfig.organization.email}`}
                className="text-primary hover:underline"
              >
                {siteConfig.organization.email}
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}