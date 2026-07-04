"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    slug: "starter" as const,
    description: "Perfect for individuals.",
    price: "Free",
    features: ["3 analyses per month", "Basic exports", "Reveal Index™"],
    highlighted: false,
  },
  {
    name: "Developer",
    slug: "developer" as const,
    description: "For builders shipping regularly.",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited analyses",
      "Markdown & JSON export",
      "Blueprint™ & Action Queue™",
      "Priority processing",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    slug: "business" as const,
    description: "For teams.",
    price: "$49",
    period: "/month",
    features: [
      "Everything in Developer",
      "Team history",
      "Notion & Linear export",
      "Dedicated support",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Simple pricing.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "flex h-full flex-col",
                  plan.highlighted && "border-primary ring-2 ring-primary/20"
                )}
              >
                <CardContent className="flex flex-1 flex-col pt-0">
                  {plan.highlighted && (
                    <span className="mb-4 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Most Popular
                    </span>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted">{plan.description}</p>
                  <div className="mt-6">
                    <span className="font-heading text-4xl font-semibold">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted">{plan.period}</span>
                    )}
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <span className="mt-1 text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.slug === "starter" ? (
                    <Button
                      asChild
                      variant="secondary"
                      className="mt-8 w-full"
                    >
                      <Link href="/mission-control">Start Free</Link>
                    </Button>
                  ) : (
                    <CheckoutButton
                      plan={plan.slug}
                      variant={plan.highlighted ? "default" : "secondary"}
                      className="mt-8 w-full"
                    >
                      Start Free
                    </CheckoutButton>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}