"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IllustrationSlot } from "@/components/landing/illustration-slot";
import { SectionIllustration } from "@/components/landing/section-illustration";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

export function InsightSection() {
  return (
    <section className="illustration-section border-t border-border py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
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
            <Link href={PUBLIC_SAMPLE_REPORT_PATH}>See a Live Analysis</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}