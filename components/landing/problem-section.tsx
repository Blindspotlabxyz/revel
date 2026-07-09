"use client";

import { motion } from "framer-motion";
import { Box, MessageSquare, Layout, Users } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const cards = [
  {
    icon: Box,
    title: "Product",
    description: "Does your value proposition make sense?",
  },
  {
    icon: Layout,
    title: "UX",
    description: "Where are users getting stuck?",
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description: "What isn't being communicated clearly?",
  },
  {
    icon: Users,
    title: "Competition",
    description: "What are others doing better?",
  },
];

export function ProblemSection() {
  return (
    <section className="border-t border-border bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="section-eyebrow">The blindspot</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            You&apos;re too close to your own product.
          </h2>
          <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-muted">
            When you build every day, it&apos;s easy to overlook problems. Weak
            messaging. Confusing onboarding. Missing trust. Hidden UX friction.
            Competitors moving faster. Revel uncovers those blindspots before
            your users do.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Card className="h-full hover:-translate-y-0.5">
                <CardContent className="pt-0">
                  <div className="icon-well mb-4">
                    <card.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {card.description}
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
