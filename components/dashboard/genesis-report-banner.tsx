import Link from "next/link";

interface GenesisReportBannerProps {
  website: string;
}

export function GenesisReportBanner({ website }: GenesisReportBannerProps) {
  return (
    <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">
        Genesis report
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        The first analysis to go live on Revel — a real run on{" "}
        <span className="font-medium">{website}</span>, not a mock or template.
        This is the actual product flow: scrape, audit, blueprint, and export.
      </p>
      <p className="mt-3 text-sm text-muted">
        Browse the tabs below, then run your own when you&apos;re ready.
      </p>
      <Link
        href="/mission-control"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Analyze your product →
      </Link>
    </div>
  );
}