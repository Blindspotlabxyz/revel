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
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="section-eyebrow">Process</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            From URL to roadmap in five steps.
          </h2>
          <p className="mt-4 text-lg text-muted">
            A clear sequence — paste once, leave with what to fix next.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-5 md:gap-4">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-[calc(50%+1.5rem)] top-6 hidden h-px w-[calc(100%-1.5rem)] bg-gradient-to-r from-primary/40 to-border md:block"
                />
              )}
              <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface shadow-sm">
                  <step.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-heading text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
