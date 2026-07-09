"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

export function CtaSection() {
  return (
    <section className="px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-ink px-8 py-16 text-center shadow-[var(--shadow-card-hover)] md:px-16 md:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary-soft/80">
            Ready when you are
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Your next improvement is already there.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/65">
            You just haven&apos;t seen it yet.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/mission-control">
                Run Revel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-white/15 bg-white/10 text-white shadow-none hover:bg-white/15 hover:text-white"
            >
              <Link href={PUBLIC_SAMPLE_REPORT_PATH}>See Genesis Report</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
