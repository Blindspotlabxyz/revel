"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IllustrationSlot } from "@/components/landing/illustration-slot";
import { SectionIllustration } from "@/components/landing/section-illustration";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

export function Hero() {
  return (
    <section className="illustration-section relative overflow-hidden">
      {/* Soft signal glow — signature atmosphere, not decoration noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-28 md:grid-cols-2 md:items-center md:gap-16 md:pb-20 md:pt-32">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="section-eyebrow"
          >
            Product intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 }}
            className="mt-5 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.35rem]"
          >
            Find the{" "}
            <span className="relative inline-block text-primary">
              hidden gaps
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-[0.22em] rounded-sm bg-primary/15"
              />
            </span>{" "}
            stopping your product from growing.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="mt-6 max-w-[36rem] text-lg leading-relaxed text-muted"
          >
            Paste your website. Revel analyzes product, UX, messaging, and
            competitors — then returns a prioritized roadmap your team can
            ship.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/mission-control">
                Run Revel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={PUBLIC_SAMPLE_REPORT_PATH}>See a live report</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="mt-7 text-sm text-muted"
          >
            Built for founders, product teams, and builders.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
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
      </div>
    </section>
  );
}
