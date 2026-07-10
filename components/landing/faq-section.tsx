"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { homepageFaqs } from "@/lib/seo/faqs";

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center font-heading text-3xl font-semibold md:text-4xl">
          Common questions
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted">
          The essentials. Full answers by topic on the FAQ page.
        </p>

        <Accordion type="single" collapsible className="mt-10">
          {homepageFaqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-8 text-center text-sm text-muted">
          Looking for privacy, exports, or partner access?{" "}
          <Link
            href="/docs/faq"
            className="font-medium text-primary hover:underline"
          >
            Browse all FAQs by topic
          </Link>
        </p>
      </div>
    </section>
  );
}
