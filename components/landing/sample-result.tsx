"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_SAMPLE_REPORT_PATH } from "@/lib/public-sample-report";

const stats = [
  { label: "Reveal Index", value: "91" },
  { label: "Critical Blindspots", value: "3" },
  { label: "High Priority", value: "7" },
  { label: "Tasks Generated", value: "18" },
];

export function SampleResult() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">
          A report your team can act on.
        </h2>
        <p className="mt-4 max-w-[680px] text-lg text-muted">
          Clean cards. Clear priorities. No dashboards full of charts.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25 }}
          className="mt-12 rounded-2xl border border-border bg-background p-8 md:p-12"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-0">
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-2 font-heading text-4xl font-semibold text-primary">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="secondary">
              <Link href={PUBLIC_SAMPLE_REPORT_PATH}>View Live Report</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}