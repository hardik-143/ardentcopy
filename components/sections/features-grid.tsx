"use client";

import type { PagebuilderType, SanityRichTextProps } from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityIcon } from "../elements/sanity-icon";

export type FeaturesGridProps = PagebuilderType<"featuresGrid">;

type FeatureBlock = NonNullable<FeaturesGridProps["features"]>[number];

const circleBgClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums text-muted-foreground md:size-10 md:text-base";

function FeatureBlock({
  block,
  index,
  showNumbers,
}: {
  block: FeatureBlock;
  index: number;
  showNumbers: boolean;
}) {
  const { icon, heading, body } = block ?? {};
  const number = index + 1;
  const showCircle = Boolean(icon || (showNumbers && number));
  const hasHeader = showCircle || Boolean(heading) || Boolean(body?.length);
  return (
    <div className="flex flex-col gap-3">
      {hasHeader && (
        <>
          {showCircle && (
            <span className={circleBgClass} aria-hidden>
              {icon ? (
                <SanityIcon
                  alt=""
                  className="size-5 shrink-0 md:size-6"
                  icon={icon}
                />
              ) : (
                number
              )}
            </span>
          )}
          {heading && (
            <h3 className="font-semibold text-lg tracking-tight text-foreground md:text-xl">
              {heading}
            </h3>
          )}
        </>
      )}
      {body && body.length > 0 && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <RichText richText={body as SanityRichTextProps} />
        </div>
      )}
    </div>
  );
}

export function FeaturesGrid({
  mainTitle,
  features,
  showNumbers = false,
  disclaimer,
}: FeaturesGridProps) {
  if (!mainTitle && !features?.length) {
    return null;
  }

  return (
    <section className="relative py-6 md:py-16" aria-labelledby="features-grid-title">
      <div
        className="absolute inset-0 left-1/2 w-screen -translate-x-1/2 bg-card -z-10"
        aria-hidden
      />
      <div className="container relative mx-auto px-4 md:px-8">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-[5fr_7fr] lg:items-stretch">
          <div className="flex flex-col items-center justify-center lg:items-start lg:justify-center lg:h-full">
            {mainTitle && (
              <h2
                className="font-bold text-3xl leading-tight tracking-tight text-foreground md:text-4xl lg:text-[2.5rem] text-center lg:text-left"
                id="features-grid-title"
              >
                {mainTitle}
              </h2>
            )}
          </div>
          <div className="flex flex-col gap-8 sm:grid sm:grid-cols-2">
            {features?.map((block, index) => (
              <FeatureBlock
                block={block}
                index={index}
                key={block._key}
                showNumbers={showNumbers}
              />
            ))}
          </div>
        </div>
        {disclaimer && (
          <p className="mt-6 text-center text-sm italic text-muted-foreground">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
