"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenesisStatCards } from "@/components/landing/genesis-stat-cards";
import { IllustrationSlot } from "@/components/landing/illustration-slot";
import { SectionIllustration } from "@/components/landing/section-illustration";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

export function InsightSection() {
  return (
    <section className="illustration-section border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <IllustrationSlot>
              <SectionIllustration
                desktopSrc="/images/insight-telescope-desktop-16x9.jpg"
                mobileSrc="/images/insight-telescope-mobile-9x16.jpg"
                alt="See your product with fresh eyes"
              />
            </IllustrationSlot>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="max-w-xl"
          >
            <p className="section-eyebrow">Fresh eyes</p>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
              See your product with fresh eyes.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Revel reviews your product from multiple perspectives and surfaces
              the insights that matter most — not a wall of charts.
            </p>
            <Button asChild className="mt-8">
              <Link href={PUBLIC_SAMPLE_REPORT_PATH}>
                See a live analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mt-16 md:mt-20"
        >
          <p className="font-heading text-xl font-bold tracking-tight md:text-2xl">
            A report your team can act on.
          </p>
          <p className="mt-3 max-w-[40rem] text-muted">
            Clean cards. Clear priorities. Real output from Revel&apos;s audit
            of Arcapush.
          </p>

          <GenesisStatCards className="mt-8" />
        </motion.div>
      </div>
    </section>
  );
}
