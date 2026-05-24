"use client";

import { Button } from "@/utils/ui/components/button";
import { cn } from "@/utils/ui/lib/utils";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import type { PortableTextBlock } from "next-sanity";

import type { PagebuilderType, SanityImageProps } from "@/types";
import CustomPortableText from "@/components/PortableTextComponents/PortableText";
import { SanityImage } from "../elements/sanity-image";

type ContentListProps = PagebuilderType<"contentList">;
type ContentItem = NonNullable<ContentListProps["items"]>[number];

function ContentItem({ item, index }: { item: ContentItem; index: number }) {
  const imageLeft = index % 2 === 0;
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <article className="group grid grid-cols-1 overflow-hidden bg-[#244a51] text-white md:grid-cols-5">
      <div
        className={cn(
          "relative min-h-[300px] w-full overflow-hidden bg-[#123940] md:col-span-2 md:min-h-[420px]",
          imageLeft ? "md:order-first" : "md:order-last"
        )}
      >
        {item.image?.id && (
          <SanityImage
            className="size-full min-h-[300px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] md:min-h-[420px]"
            height={760}
            image={item.image as SanityImageProps}
            width={960}
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(11,48,51,0.06)_0%,_rgba(11,48,51,0.34)_100%)]" />
        <span className="absolute bottom-5 left-5 border border-[#39bfd6]/20 bg-[#0b3033]/82 px-3 py-1 text-[0.7rem] font-semibold text-[#d48d4d] uppercase tracking-[0.32em] backdrop-blur-md">
          {indexLabel}
        </span>
      </div>

      <div
        className={cn(
          "flex min-h-[360px] flex-col justify-center bg-[radial-gradient(circle_at_top_left,_rgba(57,191,214,0.14),_transparent_38%),linear-gradient(140deg,_rgba(255,255,255,0.05),_rgba(36,74,81,1)_48%,_rgba(18,57,64,0.82))] px-6 py-10 sm:px-8 md:col-span-3 md:py-14 lg:px-14",
          imageLeft ? "md:order-last" : "md:order-first"
        )}
      >
        {item.heading && (
          <>
            <h3 className="mb-0 text-balance font-semibold text-2xl leading-[1.08] text-white sm:text-3xl lg:text-4xl">
              {item.heading}
            </h3>
            <div className="mt-5 mb-6 h-1 w-16 bg-[#d48d4d]" />
          </>
        )}

        {Array.isArray(item.description) && item.description.length > 0 && (
          <div
            className={cn(
              "text-base leading-relaxed text-white/75 lg:text-[1.05rem] lg:leading-8",
              "[&_a]:text-[#39bfd6] [&_a]:decoration-[#39bfd6]/50 [&_a:hover]:text-white",
              "[&_blockquote]:border-[#d48d4d] [&_blockquote]:bg-white/5 [&_blockquote]:text-white/75",
              "[&_h2]:border-white/10 [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white/85",
              "[&_li]:text-white/75 [&_ol]:text-white/75 [&_p]:text-white/75 [&_strong]:text-white [&_ul]:text-white/75",
              "[&_ol]:marker:text-[#39bfd6] [&_ul]:marker:text-[#39bfd6]"
            )}
          >
            <CustomPortableText value={item.description as PortableTextBlock[]} />
          </div>
        )}

        {item.buttons && item.buttons.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-3">
            {item.buttons.map((btn) => (
              <Button
                key={btn._key}
                asChild
                variant={btn.variant ?? "default"}
              >
                <Link
                  href={stegaClean(btn.href ?? "#")}
                  rel={btn.openInNewTab ? "noopener noreferrer" : undefined}
                  target={btn.openInNewTab ? "_blank" : undefined}
                >
                  {btn.text}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function ContentListBlock({
  eyebrow,
  title,
  description,
  items,
}: ContentListProps) {
  if (!items?.length) return null;

  const hasDescription = Array.isArray(description) && description.length > 0;

  return (
    <section className="w-screen max-w-none overflow-hidden bg-[#0b3033] py-16 text-white [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)] md:py-24 xl:py-28">
      <div className="mx-auto max-w-[1540px] px-4 md:px-6">
        {(eyebrow || title || hasDescription) && (
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10 xl:mb-16">
            {(eyebrow || title) && (
              <div className="min-w-0 max-w-5xl shrink md:max-w-[min(100%,48rem)]">
                {eyebrow && (
                  <p className="mb-0 text-[0.72rem] font-semibold text-[#d48d4d] uppercase tracking-[0.32em]">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h2
                    className={cn(
                      "mb-0 text-balance font-semibold text-3xl leading-[1.05] text-white sm:text-4xl sm:leading-[1.04] lg:text-5xl lg:leading-[1.02]",
                      eyebrow && "mt-3"
                    )}
                  >
                    {title}
                  </h2>
                )}
              </div>
            )}
            {hasDescription && (
              <div
                className={cn(
                  "w-full max-w-[24rem] shrink-0 text-base leading-relaxed text-white/75 md:w-auto lg:text-[1.05rem] lg:leading-8",
                  "[&_a]:text-[#39bfd6] [&_a:hover]:text-white [&_p]:text-white/75 [&_strong]:text-white"
                )}
              >
                <CustomPortableText
                  value={description as PortableTextBlock[]}
                />
              </div>
            )}
          </div>
        )}

        <div className="grid gap-10 overflow-hidden">
          {items.map((item, index) => (
            <ContentItem index={index} item={item} key={item._key} />
          ))}
        </div>
      </div>
    </section>
  );
}
