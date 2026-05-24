"use client";

import { ArrowRight, Phone, Star } from "lucide-react";
import Link from "next/link";
import { stegaClean } from "next-sanity";

import type { PagebuilderType } from "@/types";
import { SanityIcon } from "../elements/sanity-icon";
import { SanityImage } from "../elements/sanity-image";
import { TitleWithHighlight } from "../elements/title-with-highlight";

type HeroBlockProps = PagebuilderType<"heroPrimary">;
type TrustItem = NonNullable<NonNullable<HeroBlockProps["trustItems"]>[number]>;
type HeroButton = NonNullable<NonNullable<HeroBlockProps["buttons"]>[number]>;

function isPhoneLink(href?: string | null): boolean {
  return Boolean(href?.startsWith("tel:"));
}

function HeroPrimaryButton({
  button,
  index,
}: {
  button: HeroButton;
  index: number;
}) {
  const href = stegaClean(button.href ?? "#");
  const phoneButton = isPhoneLink(href);
  const className = phoneButton
    ? "inline-flex min-h-16 items-center justify-center gap-4 bg-[#ef973c] px-8 py-4 font-semibold text-[#113f46] transition-colors hover:bg-[#ffab52] lg:min-w-[270px]"
    : "inline-flex min-h-16 items-center justify-center gap-4 border border-white/20 bg-transparent px-8 py-4 font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/6 lg:min-w-[300px]";

  return (
    <Link
      className={className}
      href={href}
      rel={button.openInNewTab ? "noopener noreferrer" : undefined}
      target={button.openInNewTab ? "_blank" : undefined}
    >
      {phoneButton ? (
        <Phone aria-hidden className="size-5 shrink-0" strokeWidth={2.2} />
      ) : null}
      <span>{button.text}</span>
      {!phoneButton || index > 0 ? (
        <ArrowRight aria-hidden className="size-6 shrink-0" strokeWidth={2.1} />
      ) : null}
    </Link>
  );
}

function TrustMetric({ item }: { item: TrustItem }) {
  return (
    <div className="min-w-0">
      {item.displayStyle === "stars" ? (
        <div className="mb-4 flex items-center gap-2 text-[#ef973c]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              aria-hidden
              className="size-6 fill-current"
              key={index}
              strokeWidth={1.8}
            />
          ))}
        </div>
      ) : item.icon ? (
        <SanityIcon className="mb-4 size-6 text-[#58c9d3]" icon={item.icon} />
      ) : null}
      <div className="text-4xl font-semibold leading-none text-white">
        {item.value}
      </div>
      <div className="mt-3 text-base text-white/62">{item.label}</div>
    </div>
  );
}

function CertificationCard({
  title,
  subtitle,
}: {
  title?: string | null;
  subtitle?: string | null;
}) {
  if (!title && !subtitle) {
    return null;
  }

  return (
    <div className="bg-white px-7 py-6 shadow-2xl shadow-black/18">
      <div className="min-w-0">
        {title ? (
          <div className="text-pretty font-semibold text-[#113f46] text-xl leading-tight">
            {title}
          </div>
        ) : null}
        {subtitle ? (
          <div className="mt-1 text-[#6c7f83] text-lg leading-snug">
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HeroBlock({
  badge,
  backgroundImage,
  buttons,
  certificationSubtitle,
  certificationTitle,
  highlightedText,
  image,
  subtitle,
  title,
  trustItems,
}: HeroBlockProps) {
  const actions = Array.isArray(buttons) ? buttons.slice(0, 2) : [];
  const metrics = Array.isArray(trustItems) ? trustItems.slice(0, 3) : [];
  const backgroundAsset = backgroundImage?.id ? backgroundImage : null;

  return (
    <section
      className="relative isolate w-screen max-w-none overflow-hidden bg-[#113f46] [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)]"
      id="hero-primary"
    >
      {backgroundAsset ? (
        <SanityImage
          className="absolute inset-0 h-full w-full object-cover"
          height={1800}
          image={backgroundAsset}
          width={3200}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: backgroundAsset ? "rgb(17 63 70 / 0.62)" : "#113f46",
        }}
      />

      <div className="relative mx-auto max-w-[1540px] px-4 py-16 md:px-6 lg:py-20 xl:py-24">
        <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.82fr)] xl:gap-16">
          <div className="min-w-0">
            {badge ? (
              <div className="mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.38em] leading-none text-[#ef973c]">
                {badge}
              </div>
            ) : null}

            {title ? (
              <h1 className="mb-0 mt-6 text-white">
                <TitleWithHighlight
                  className="block whitespace-pre-line text-balance text-[clamp(3.5rem,8vw,7.25rem)] font-semibold leading-[0.93] tracking-[-0.04em]"
                  highlightClassName="text-[#ef973c]"
                  highlightedText={highlightedText}
                  title={title}
                />
              </h1>
            ) : null}

            {subtitle ? (
              <div className="mt-10 max-w-3xl">
                <div className="mb-7 h-1 w-28 bg-[#58c9d3]" />
                <p className="mb-0 text-pretty text-[1.2rem] leading-10 text-white/78 lg:text-[1.25rem]">
                  {subtitle}
                </p>
              </div>
            ) : null}

            {actions.length > 0 ? (
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {actions.map((button, index) => (
                  <HeroPrimaryButton
                    button={button}
                    index={index}
                    key={button._key}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="relative">
              {image?.id ? (
                <SanityImage
                  className="h-auto w-full object-contain"
                  height={1600}
                  image={image}
                  width={1200}
                />
              ) : (
                <div className="min-h-[540px] bg-[linear-gradient(145deg,#183f46,#224f58)]" />
              )}
            </div>

            {metrics.length > 0 ? (
              <div className="mt-8 border-white/10 border-t pt-8">
                <div className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
                  {metrics.map((item) => (
                    <TrustMetric item={item} key={item._key} />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <CertificationCard
                subtitle={certificationSubtitle}
                title={certificationTitle}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
