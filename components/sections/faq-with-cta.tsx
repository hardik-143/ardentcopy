"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/utils/ui/components/accordion";

import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityButtons } from "../elements/sanity-buttons";
import { SanityImage } from "../elements/sanity-image";
import { SanityIcon } from "../elements/sanity-icon";

type FaqWithCtaProps = PagebuilderType<"faqWithCta">;

type HighlightItem = NonNullable<FaqWithCtaProps["highlights"]>[number];

const cardHeaderIconClass =
  "flex size-10 shrink-0 items-center justify-center text-foreground md:size-11";

const highlightIconClass =
  "flex size-9 shrink-0 items-center justify-center text-foreground md:size-10";

function HighlightRow({ item }: { item: HighlightItem }) {
  const { icon, title } = item ?? {};
  return (
    <div className="flex gap-3 items-center">
      {icon && (
        <span className={highlightIconClass} aria-hidden>
          <SanityIcon alt="" className="size-5 md:size-6" icon={icon} />
        </span>
      )}
      {title && (
        <span className="font-medium text-foreground">{title}</span>
      )}
    </div>
  );
}

export function FaqWithCta({
  title,
  ctaCardTitle,
  ctaCardSubtitle,
  ctaCardIcon,
  faqs,
  highlights,
  buttons,
}: FaqWithCtaProps) {
  const hasFaqs = faqs?.length && faqs.length > 0;
  const hasHighlights = highlights?.length && highlights.length > 0;
  const hasCta = buttons?.length && buttons.length > 0;
  const hasCardHeader = ctaCardTitle ?? ctaCardSubtitle ?? ctaCardIcon;

  if (!title && !hasFaqs && !hasHighlights && !hasCta && !hasCardHeader) {
    return null;
  }

  return (
    <section className="my-6 md:my-16" aria-labelledby="faq-with-cta-title">
      <div className="container mx-auto px-4">
        {title && (
          <h2
            className="mb-8 text-center font-bold text-3xl leading-tight tracking-tight text-foreground md:mb-12 md:text-4xl lg:text-[2.5rem]"
            id="faq-with-cta-title"
          >
            {title}
          </h2>
        )}
        <div className="grid gap-8 md:gap-12 md:grid-cols-[5fr_3fr] lg:grid-cols-[7fr_5fr]">
          <div className="order-2 md:order-1">
            {hasFaqs && (
              <Accordion
                className="w-full"
                collapsible
                type="single"
              >
                {faqs?.map((faq, index) => (
                  <AccordionItem
                    className="py-2"
                    key={`faq-${faq?._id ?? index}`}
                    value={faq?._id ?? `item-${index}`}
                  >
                    <AccordionTrigger className="group py-2 text-[15px] leading-6 hover:no-underline">
                      {faq?.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 text-muted-foreground">
                      <RichText
                        className="text-sm md:text-base"
                        richText={faq?.richText ?? []}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
          <div className="order-1 md:order-2">
            <div className="rounded-2xl bg-card p-8 md:p-10">
              <div className="flex flex-col">
                {hasCardHeader && (
                  <div className="flex gap-4 items-start pb-6">
                    {ctaCardIcon?.id && (
                      <span className={cardHeaderIconClass} aria-hidden>
                        <SanityImage
                          alt={ctaCardIcon.alt ?? ""}
                          className="size-full object-contain p-1.5"
                          image={ctaCardIcon}
                        />
                      </span>
                    )}
                    <div className="flex min-w-0 flex-col gap-1">
                      {ctaCardTitle && (
                        <span className="font-bold text-foreground text-lg">
                          {ctaCardTitle}
                        </span>
                      )}
                      {ctaCardSubtitle && (
                        <span className="text-sm text-foreground">
                          {ctaCardSubtitle}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {hasHighlights && (
                  <div className="flex flex-col">
                    {highlights?.map((item, index) => (
                      <div className="w-full" key={item._key}>
                        {index > 0 && (
                          <hr
                            className="my-0 w-full border-0 border-t border-border"
                            role="presentation"
                          />
                        )}
                        <HighlightRow item={item} />
                      </div>
                    ))}
                  </div>
                )}
                {hasCta && (
                  <div className="w-full pt-8">
                    <SanityButtons
                      buttonClassName="w-full"
                      buttons={buttons}
                      className="flex w-full flex-col gap-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
