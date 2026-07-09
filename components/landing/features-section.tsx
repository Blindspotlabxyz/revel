"use client";

import { motion } from "framer-motion";
import {
  Target,
  MousePointerClick,
  MessageCircle,
  Users,
  Gauge,
  Map,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Product analysis",
    description: "Review positioning, features, and clarity.",
  },
  {
    icon: MousePointerClick,
    title: "UX review",
    description: "Find friction across the user journey.",
  },
  {
    icon: MessageCircle,
    title: "Messaging audit",
    description: "Improve headlines, trust, and communication.",
  },
  {
    icon: Users,
    title: "Competitor review",
    description: "Understand where you stand in the market.",
  },
  {
    icon: Gauge,
    title: "Reveal Index™",
    description: "A simple score showing overall product health.",
  },
  {
    icon: Map,
    title: "Blueprint™",
    description: "Know exactly what to improve next.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="section-eyebrow">Capabilities</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to improve your product.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Six lenses. One audit. A roadmap you can execute.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Card className="h-full hover:-translate-y-0.5">
                <CardContent className="pt-0">
                  <div className="icon-well mb-4">
                    <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
