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
    title: "Product Analysis",
    description: "Review positioning, features and clarity.",
  },
  {
    icon: MousePointerClick,
    title: "UX Review",
    description: "Find friction across the user journey.",
  },
  {
    icon: MessageCircle,
    title: "Messaging Audit",
    description: "Improve headlines, trust and communication.",
  },
  {
    icon: Users,
    title: "Competitor Review",
    description: "Understand where you stand.",
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
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">
          Everything you need to improve your product.
        </h2>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Card className="h-full hover:-translate-y-1">
                <CardContent className="pt-0">
                  <feature.icon className="mb-4 h-5 w-5 text-primary" />
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