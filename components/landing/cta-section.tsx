"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

export function CtaSection() {
  return (
    <section className="py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
          Your next improvement is already there.
        </h2>
        <p className="mt-4 text-xl text-muted">
          You just haven&apos;t seen it yet.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/mission-control">Run Revel</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href={PUBLIC_SAMPLE_REPORT_PATH}>See Genesis Report</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}