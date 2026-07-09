"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { revelFaqs } from "@/lib/seo/faqs";

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <p className="section-eyebrow mx-auto">FAQ</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Questions
          </h2>
          <p className="mt-3 text-muted">
            Straight answers about how Revel works.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {revelFaqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-heading text-base font-semibold tracking-tight">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
