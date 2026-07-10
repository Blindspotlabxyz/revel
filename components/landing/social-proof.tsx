import Link from "next/link";
import { GENESIS_REPORT_WEBSITE } from "@/lib/genesis-report-stats";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

const signals = [
  {
    label: "Listed on OKX.AI",
    href: "https://web3.okx.com/ai/home",
    external: true,
  },
  {
    label: "Open source on GitHub",
    href: "https://github.com/Blindspotlabxyz/revel",
    external: true,
  },
  {
    label: "Partner API ready",
    href: "/partners",
    external: false,
  },
  {
    label: "Live Genesis report",
    href: PUBLIC_SAMPLE_REPORT_PATH,
    external: false,
  },
];

export function SocialProof() {
  let host = "arcapush.com";
  try {
    host = new URL(GENESIS_REPORT_WEBSITE).hostname.replace(/^www\./, "");
  } catch {
    /* keep default */
  }

  return (
    <section className="border-y border-border bg-surface/60 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium text-foreground">
          Built for founders shipping software worldwide
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted">
          Real product audits, exportable roadmaps, and agent-ready APIs. Not a
          regional demo: public URL in, prioritized Blueprint out.
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {signals.map((item) => (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-muted">
          Sample audit on{" "}
          <a
            href={GENESIS_REPORT_WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary"
          >
            {host}
          </a>
          {" · "}
          <Link
            href={PUBLIC_SAMPLE_REPORT_PATH}
            className="font-medium text-primary hover:underline"
          >
            Open the full report
          </Link>
        </p>
      </div>
    </section>
  );
}
