"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GenesisStatCards } from "@/components/landing/genesis-stat-cards";
import {
  PRIMARY_CTA,
  PRIMARY_CTA_HREF,
  SECONDARY_CTA,
  SECONDARY_CTA_HREF,
} from "@/lib/cta";
import { GENESIS_REPORT_WEBSITE } from "@/lib/genesis-report-stats";

export function DemoSection() {
  let host = "arcapush.com";
  try {
    host = new URL(GENESIS_REPORT_WEBSITE).hostname.replace(/^www\./, "");
  } catch {
    /* keep default */
  }

  return (
    <section
      id="demo"
      className="border-t border-border bg-background py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Live demo
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
            Preview a real report before you run your own.
          </h2>
          <p className="mt-4 text-lg text-muted">
            The Genesis report is a full public audit of {host}: Reveal Index,
            blindspots, Blueprint, and Action Queue. No signup required to read
            it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={SECONDARY_CTA_HREF}>{SECONDARY_CTA}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
            </Button>
          </div>
        </motion.div>

        <GenesisStatCards className="mt-12" />
      </div>
    </section>
  );
}
