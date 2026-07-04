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
    <section id="faq" className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center font-heading text-3xl font-semibold md:text-4xl">
          Questions
        </h2>

        <Accordion type="single" collapsible className="mt-12">
          {revelFaqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
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