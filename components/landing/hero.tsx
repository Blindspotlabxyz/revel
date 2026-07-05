"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IllustrationSlot } from "@/components/landing/illustration-slot";
import { SectionIllustration } from "@/components/landing/section-illustration";

export function Hero() {
  return (
    <section className="illustration-section mx-auto grid max-w-6xl gap-8 px-6 pb-12 pt-32 md:grid-cols-2 md:items-start md:gap-16">
      <div className="max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]"
        >
          Find the hidden gaps stopping your product from growing.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="mt-6 max-w-[680px] text-lg leading-relaxed text-muted"
        >
          Paste your website. Revel analyzes your product, user experience,
          messaging, and competitors, then generates a roadmap your team can
          actually execute.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Button asChild size="lg">
            <Link href="/mission-control">Run Revel</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/mission-control/sample">View Sample Report</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="mt-6 text-sm text-muted"
        >
          Built for founders, product teams and builders.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <IllustrationSlot className="hero-illustration-slot">
          <SectionIllustration
            desktopSrc="/images/hero-peel-desktop-16x9.jpg"
            mobileSrc="/images/hero-peel-mobile-9x16.jpg"
            alt="Revel product analysis illustration"
            priority
          />
        </IllustrationSlot>
      </motion.div>
    </section>
  );
}