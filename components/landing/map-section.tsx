"use client";

import { motion } from "framer-motion";
import { IllustrationSlot } from "@/components/landing/illustration-slot";
import { SectionIllustration } from "@/components/landing/section-illustration";

export function MapSection() {
  return (
    <section className="illustration-section py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <IllustrationSlot>
            <SectionIllustration
              desktopSrc="/images/map-reveal-desktop-16x9.jpg"
              mobileSrc="/images/map-reveal-mobile-9x16.jpg"
              alt="Small improvements create massive outcomes"
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
          <p className="section-eyebrow">Compound gains</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Small improvements create massive outcomes.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            The best products rarely win because of one big feature. They win
            because they fix hundreds of small blindspots. That&apos;s exactly
            what Revel helps you discover.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
