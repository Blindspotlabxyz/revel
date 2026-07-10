"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GenesisStatCards } from "@/components/landing/genesis-stat-cards";
import { IllustrationSlot } from "@/components/landing/illustration-slot";
import { SectionIllustration } from "@/components/landing/section-illustration";
import { SECONDARY_CTA, SECONDARY_CTA_HREF } from "@/lib/cta";

export function InsightSection() {
  return (
    <section className="illustration-section border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
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
            transition={{ duration: 0.25 }}
            className="max-w-xl"
          >
            <h2 className="font-heading text-3xl font-semibold md:text-4xl">
              See your product with fresh eyes.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Revel reviews your product from multiple perspectives and surfaces
              the insights that matter most.
            </p>
            <Button asChild className="mt-8">
              <Link href={SECONDARY_CTA_HREF}>{SECONDARY_CTA}</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mt-16 md:mt-20"
        >
          <p className="font-heading text-xl font-semibold md:text-2xl">
            A report your team can act on.
          </p>
          <p className="mt-3 max-w-[680px] text-muted">
            Clean cards. Clear priorities. No dashboards full of charts. Real
            output from Revel&apos;s audit of Arcapush.
          </p>

          <GenesisStatCards className="mt-8" />
        </motion.div>
      </div>
    </section>
  );
}