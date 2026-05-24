import { cn } from "@/utils/ui/lib/utils";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import type { CSSProperties } from "react";

import type { PagebuilderType } from "@/types";
import { SanityIcon } from "../elements/sanity-icon";
import { SanityImage } from "../elements/sanity-image";
import { TitleWithHighlight } from "../elements/title-with-highlight";

export type ServiceCardsProps = PagebuilderType<"serviceCards">;

type ServiceCard = NonNullable<ServiceCardsProps["serviceCards"]>[number];

const DEFAULT_CARD_COLOR = "#39bfd6";

function hexToRgbChannels(hex: string): string | null {
  const normalizedHex = hex.trim().replace(/^#/, "");
  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalizedHex;

  if (!/^[0-9a-fA-F]{6}$/.test(expandedHex)) {
    return null;
  }

  const red = Number.parseInt(expandedHex.slice(0, 2), 16);
  const green = Number.parseInt(expandedHex.slice(2, 4), 16);
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

function resolveCardStyles(color?: string | null): CSSProperties {
  const cardColor = color?.trim() || DEFAULT_CARD_COLOR;
  const rgbChannels = hexToRgbChannels(cardColor) ?? "57 191 214";

  return {
    "--service-card-color": cardColor,
    "--service-card-color-rgb": rgbChannels,
  } as CSSProperties;
}

type CaseTypeItemProps = {
  item: NonNullable<ServiceCardsProps["caseTypes"]>[number];
};

function CaseTypeItem({ item }: CaseTypeItemProps) {
  const { _key, href: rawHref, openInNewTab, title } = item ?? {};
  const href = stegaClean(rawHref ?? "");
  const content = (
    <>
      <Check
        aria-hidden
        className="mt-1 size-4 shrink-0 text-[#f0a044]"
        strokeWidth={2.5}
      />
      <span className="text-white/72 transition-colors hover:text-white">
        {title}
      </span>
    </>
  );

  return (
    <li className="flex items-start gap-2 text-sm" key={_key}>
      {href ? (
        <Link
          className="flex items-start gap-2"
          href={href}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          target={openInNewTab ? "_blank" : "_self"}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}

function ServiceCardTile({ card }: { card: ServiceCard }) {
  const {
    color,
    description,
    eyebrow,
    href: rawHref,
    icon,
    image,
    linkText,
    openInNewTab,
    title,
  } = card ?? {};
  const href = stegaClean(rawHref ?? "");
  const cardStyles = resolveCardStyles(color);

  const content = (
    <article
      className="group relative flex h-full min-h-[320px] flex-col overflow-hidden border border-white/8 bg-[#244a51] text-white sm:min-h-[360px]"
      style={cardStyles}
    >
      {image?.id ? (
        <div className="absolute inset-0 overflow-hidden">
          <SanityImage
            alt={title ?? image.alt ?? "Service background"}
            className="size-full min-h-full min-w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            height={960}
            image={image}
            width={1280}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(57,191,214,0.22),_transparent_42%),linear-gradient(140deg,_rgba(255,255,255,0.08),_rgba(4,24,28,0.18)_45%,_rgba(4,24,28,0.72))]" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(8,31,35,0.38)_0%,_rgba(8,31,35,0.52)_30%,_rgba(8,31,35,0.8)_100%)] transition-opacity duration-300 group-hover:opacity-0" />
      <div className="absolute inset-0 bg-[#123940]/42 transition-opacity duration-300 group-hover:opacity-0" />
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: "var(--service-card-color)" }}
      />

      <div className="relative z-10 flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          {icon ? (
            <span
              aria-hidden
              className={cn(
                "flex size-16 items-center justify-center border border-transparent backdrop-blur-sm transition-all duration-300",
              "group-hover:border-white/40 group-hover:bg-white/10 group-hover:!text-white"
              )}
              style={{
                backgroundColor: "rgb(var(--service-card-color-rgb) / 0.14)",
                color: "var(--service-card-color)",
              }}
            >
              <SanityIcon className="size-7" icon={icon} />
            </span>
          ) : (
            <span aria-hidden className="block size-16" />
          )}

          <span className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10 group-hover:text-white">
            <ArrowUpRight
              aria-hidden
              className="size-7 transition-transform duration-300 group-hover:rotate-45"
              strokeWidth={2}
            />
          </span>
        </div>

        <div className="mt-10 flex max-w-[34rem] flex-1 flex-col">
          {eyebrow ? (
            <p className="mb-0 min-h-[1.25rem] text-[0.72rem] text-white/70 uppercase tracking-[0.32em]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mb-0 mt-4 text-balance font-semibold text-3xl leading-[1.04] text-white sm:text-[2.6rem]">
            {title}
          </h3>
          {description ? (
            <p className="mb-0 mt-4 text-base leading-8 text-white/78 sm:text-[1.05rem]">
              {description}
            </p>
          ) : null}
          {href && linkText ? (
            <span className="sr-only">{linkText}</span>
          ) : null}
        </div>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      aria-label={linkText ?? title ?? "Open service"}
      className="block h-full"
      href={href}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      target={openInNewTab ? "_blank" : "_self"}
    >
      {content}
    </Link>
  );
}

function ServiceCardsFooter({
  caseTypes,
  caseTypesHeading,
  viewAllHref,
  viewAllOpenInNewTab,
  viewAllText,
}: {
  caseTypes: ServiceCardsProps["caseTypes"];
  caseTypesHeading: ServiceCardsProps["caseTypesHeading"];
  viewAllHref: ServiceCardsProps["viewAllHref"];
  viewAllOpenInNewTab: ServiceCardsProps["viewAllOpenInNewTab"];
  viewAllText: ServiceCardsProps["viewAllText"];
}) {
  const items = Array.isArray(caseTypes) ? caseTypes : [];

  if (!caseTypesHeading && items.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-white/10 border-t pt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        {caseTypesHeading ? (
          <h3 className="mb-0 font-medium text-lg text-white/88">
            {caseTypesHeading}
          </h3>
        ) : null}
        {viewAllHref ? (
          <Link
            className="inline-flex items-center gap-2 font-medium text-[#f0a044] text-sm hover:text-[#ffc276]"
            href={stegaClean(viewAllHref)}
            rel={viewAllOpenInNewTab ? "noopener noreferrer" : undefined}
            target={viewAllOpenInNewTab ? "_blank" : "_self"}
          >
            {viewAllText ?? "View all"}
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0"
              strokeWidth={2}
            />
          </Link>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <CaseTypeItem item={item} key={item._key} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ServiceCardsBottomCta({
  buttonHref,
  buttonOpenInNewTab,
  buttonText,
  eyebrow,
  title,
}: {
  buttonHref: ServiceCardsProps["bottomCtaButtonHref"];
  buttonOpenInNewTab: ServiceCardsProps["bottomCtaButtonOpenInNewTab"];
  buttonText: ServiceCardsProps["bottomCtaButtonText"];
  eyebrow: ServiceCardsProps["bottomCtaEyebrow"];
  title: ServiceCardsProps["bottomCtaTitle"];
}) {
  if (!eyebrow && !title && !buttonHref && !buttonText) {
    return null;
  }

  return (
    <div className="mt-10 border border-white/10 bg-[#0f4349] px-6 py-8 sm:px-8 lg:mt-12 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 max-w-4xl">
          {eyebrow ? (
            <p className="mb-0 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#39bfd6]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="mb-0 mt-3 text-balance font-semibold !text-44xl leading-tight text-white">
              {title}
            </h3>
          ) : null}
        </div>

        {buttonHref ? (
          <Link
            className="inline-flex items-center justify-center gap-3 self-start bg-[#f2993a] px-7 py-4 font-semibold text-[#0b3033] transition-colors hover:bg-[#ffad59] lg:min-w-[242px] lg:self-center"
            href={stegaClean(buttonHref)}
            rel={buttonOpenInNewTab ? "noopener noreferrer" : undefined}
            target={buttonOpenInNewTab ? "_blank" : "_self"}
          >
            {buttonText ?? "Request Free Quote"}
            <ArrowUpRight
              aria-hidden
              className="size-5 shrink-0"
              strokeWidth={2}
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function ServiceCards({
  bottomCtaButtonHref,
  bottomCtaButtonOpenInNewTab,
  bottomCtaButtonText,
  bottomCtaEyebrow,
  bottomCtaTitle,
  caseTypes,
  caseTypesHeading,
  description,
  eyebrow,
  highlightedText,
  serviceCards,
  title,
  viewAllHref,
  viewAllOpenInNewTab,
  viewAllText,
}: ServiceCardsProps) {
  const hasCards = Array.isArray(serviceCards) && serviceCards.length > 0;
  const hasDescription = Boolean(description?.trim());

  return (
    <section
      aria-labelledby="service-cards-heading"
      className="overflow-hidden bg-[#0b3033] py-16 text-white md:py-24 xl:py-28"
      id="service-cards"
    >
      <div className="container mx-auto max-w-[1540px] px-4 md:px-6">
        <div
          className={cn(
            "flex flex-col gap-10",
            hasDescription &&
              "md:flex-row md:items-end md:justify-between md:gap-x-8 md:gap-y-6 lg:gap-x-12 xl:gap-x-16"
          )}
        >
          <div className="max-w-5xl min-w-0 shrink md:max-w-[min(100%,42rem)] lg:max-w-[min(100%,48rem)]">
            {eyebrow ? (
              <p className="mb-0 text-[0.72rem] font-semibold text-[#d48d4d] uppercase tracking-[0.32em]">
                {eyebrow}
              </p>
            ) : null}
            <h2
              className="mb-0 mt-3 text-balance font-semibold text-white"
              id="service-cards-heading"
            >
              <TitleWithHighlight
                highlightClassName="text-[#d48d4d]"
                highlightedText={highlightedText}
                title={title}
                className="block text-3xl leading-[1.05] sm:text-4xl sm:leading-[1.04] lg:text-5xl lg:leading-[1.02]"
              />
            </h2>
          </div>

          {description ? (
            <p className="mb-0 w-full max-w-[22rem] shrink-0 text-pretty text-base leading-relaxed text-white/75 md:w-auto md:text-left lg:max-w-[24rem] lg:text-[1.05rem] lg:leading-8">
              {description}
            </p>
          ) : null}
        </div>

        {hasCards ? (
          <div className="mt-14 grid gap-px overflow-hidden bg-white/8 md:grid-cols-2 xl:mt-16 xl:grid-cols-3">
            {serviceCards.map((card) => (
              <ServiceCardTile card={card} key={card._key} />
            ))}
          </div>
        ) : null}
        <ServiceCardsFooter
          caseTypes={caseTypes}
          caseTypesHeading={caseTypesHeading}
          viewAllHref={viewAllHref}
          viewAllOpenInNewTab={viewAllOpenInNewTab}
          viewAllText={viewAllText}
        />
        <ServiceCardsBottomCta
          buttonHref={bottomCtaButtonHref}
          buttonOpenInNewTab={bottomCtaButtonOpenInNewTab}
          buttonText={bottomCtaButtonText}
          eyebrow={bottomCtaEyebrow}
          title={bottomCtaTitle}
        />
      </div>
    </section>
  );
}
