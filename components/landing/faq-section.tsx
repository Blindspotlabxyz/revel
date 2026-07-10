"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { homepageFaqs } from "@/lib/seo/faqs";

/** Homepage FAQ — short list only; full set lives at /docs/faq */
export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-semibold md:text-4xl">
          Questions
        </h2>

        <Accordion type="single" collapsible className="mt-12">
          {homepageFaqs.map((faq, i) => (
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
