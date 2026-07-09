"use client";

import { motion } from "framer-motion";
import { FileText, Braces, Github } from "lucide-react";

const exports = [
  { name: "Notion", icon: "N" },
  { name: "Linear", icon: "L" },
  { name: "Markdown", icon: FileText },
  { name: "JSON", icon: Braces },
  { name: "GitHub", icon: Github },
];

export function ExportSection() {
  return (
    <section className="border-t border-border bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="section-eyebrow mx-auto">Export</p>
        <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Take action immediately.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          Turn recommendations into tasks with one click.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-5 md:gap-8">
          {exports.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="flex flex-col items-center gap-2.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background text-base font-semibold text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary-soft/40">
                {typeof item.icon === "string" ? (
                  <span className="font-heading text-lg font-bold text-primary">
                    {item.icon}
                  </span>
                ) : (
                  <item.icon className="h-6 w-6 text-muted" strokeWidth={1.75} />
                )}
              </div>
              <span className="text-sm font-medium text-muted">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
