import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { PageSeo } from "@/components/seo/page-seo";
import { createPageMetadata } from "@/lib/seo/metadata";

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
        <p className="mt-4 text-muted">Last updated: July 3, 2026</p>

        <div className="prose-revel mt-12 space-y-8 text-muted">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              What we collect
            </h2>
            <p className="mt-3 leading-relaxed">
              When you use Revel, we collect your email address (via authentication),
              website URLs you submit for analysis, and the analysis results we generate.
              We do not sell your data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              How we use your data
            </h2>
            <p className="mt-3 leading-relaxed">
              Your data is used solely to provide product analysis services, maintain
              your analysis history, and improve Revel. Website content is sent to our
              AI provider (OpenRouter) for analysis and is not stored permanently
              beyond what is needed for your report.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Third-party services
            </h2>
            <p className="mt-3 leading-relaxed">
              Revel uses Clerk (authentication), Supabase (data storage), OpenRouter
              (AI analysis), Stripe (payments), and Vercel (hosting). Each service
              operates under its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed">
              Questions about privacy? Reach us at{" "}
              <Link href="/contact" className="text-primary hover:underline">
                our contact page
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