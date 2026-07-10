"use client";

import { motion } from "framer-motion";
import { Globe, Search, Eye, Map, Download } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Website",
    description: "Paste your product URL to begin.",
  },
  {
    icon: Search,
    title: "Analyze",
    description: "Revel reviews every layer of your product.",
  },
  {
    icon: Eye,
    title: "Reveal",
    description: "Hidden blindspots surface instantly.",
  },
  {
    icon: Map,
    title: "Blueprint",
    description: "Get a prioritized improvement roadmap.",
  },
  {
    icon: Download,
    title: "Export",
    description: "Turn insights into actionable tasks.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">
          How It Works
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="relative text-left sm:text-left"
            >
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.5rem)] top-6 hidden h-px w-[calc(100%-1.5rem)] bg-border lg:block" />
              )}
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}