"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PRIMARY_CTA, PRIMARY_CTA_HREF } from "@/lib/cta";

const points = [
  {
    title: "Not generic AI chat",
    body: "Structured investigation: Reveal Index, blindspots, Blueprint, and Action Queue — not a freeform prompt thread.",
  },
  {
    title: "Not just Lighthouse scores",
    body: "Technical audits miss positioning, messaging, and competitive gaps. Revel focuses on growth and clarity.",
  },
  {
    title: "Faster than hiring a strategist",
    body: "Consultant-grade prioritization in minutes. Use it before (or between) expensive engagements.",
  },
];

export function DifferentiationSection() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Why not ChatGPT, Lighthouse, or a consultant?
          </h2>
          <p className="mt-4 text-lg text-muted">
            Revel is the product-strategy layer between a quick chat and a
            multi-week agency project.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-background p-6"
            >
              <h3 className="font-heading text-lg font-semibold">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {point.body}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/compare">Compare Revel side-by-side</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={PRIMARY_CTA_HREF}>{PRIMARY_CTA}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
