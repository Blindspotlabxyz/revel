"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PRIMARY_CTA, PRIMARY_CTA_HREF } from "@/lib/cta";
import { DEFAULT_WEEKLY_AUDIT_LIMIT } from "@/lib/weekly-audit-limit-config";

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
            <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Free early access · up to {DEFAULT_WEEKLY_AUDIT_LIMIT} audits / week
        </p>
      </motion.div>
    </section>
  );
}
