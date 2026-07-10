"use client";

import Link from "next/link";
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
    <section className="border-t border-border bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            You&apos;re too close to your own product.
          </h2>
          <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-muted">
            When you build every day, it&apos;s easy to overlook problems. Weak
            messaging. Confusing onboarding. Missing trust. Hidden UX friction.
            Competitors moving faster. Revel uncovers those blindspots before
            your users do.{" "}
            <Link
              href="/compare"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              How we differ from ChatGPT and audit tools
            </Link>
            .
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Card className="h-full hover:-translate-y-1">
                <CardContent className="pt-0">
                  <card.icon className="mb-4 h-5 w-5 text-primary" />
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