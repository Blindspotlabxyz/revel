"use client";

import { motion } from "framer-motion";
import { FileText, Braces, Github } from "lucide-react";

const exports = [
  { name: "Notion", icon: "📝" },
  { name: "Linear", icon: "◆" },
  { name: "Markdown", icon: FileText },
  { name: "JSON", icon: Braces },
  { name: "GitHub", icon: Github },
];

export function ExportSection() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">
          Take action immediately.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          Turn recommendations into tasks with one click.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {exports.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background text-xl">
                {typeof item.icon === "string" ? (
                  item.icon
                ) : (
                  <item.icon className="h-6 w-6 text-muted" />
                )}
              </div>
              <span className="text-sm text-muted">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}