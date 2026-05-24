"use client";

import { Badge } from "@/utils/ui/components/badge";
import { cn } from "@/utils/ui/lib/utils";
import { Check } from "lucide-react";

import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";

type FeatureCardCarouselProps = PagebuilderType<"featureCardCarousel">;

type VictoryCardProps = {
  card: NonNullable<FeatureCardCarouselProps["cards"]>[number];
};

function VictoryCard({ card }: VictoryCardProps) {
  const { amount, description, firmName, isMajorWin, caseWon } = card ?? {};
  return (
    <article
      className={cn(
        "relative flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:w-[320px] md:w-[350px] lg:w-[400px]",
        isMajorWin
          ? "border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-400 dark:from-amber-950/80 dark:to-yellow-950/80"
          : "border border-border bg-card"
      )}
    >
      {isMajorWin && (
        <div
          className="absolute end-0 top-0 rounded-bl-lg bg-amber-500 px-2 py-1 text-xs font-bold text-white dark:bg-amber-600 dark:text-amber-100 sm:px-3"
          aria-hidden
        >
          MAJOR WIN
        </div>
      )}
      <header className="shrink-0 px-4 pb-3 pt-6 sm:px-6 sm:pb-4">
        <h3 className="font-bold leading-tight text-lg text-foreground sm:text-xl md:text-2xl">
          {amount}
        </h3>
      </header>
      <div className="flex flex-1 flex-col px-4 pb-6 sm:px-6">
        <div className="flex-1">
          <RichText
            className="text-sm leading-relaxed text-foreground sm:text-base [&_p]:mb-0"
            richText={description}
          />
        </div>
        <div className="mt-3 border-t border-border pt-3 sm:mt-4 sm:pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
            <span>{firmName ?? "Firm"}</span>
            {caseWon !== false && (
              <span
                className={cn(
                  "rounded px-2 py-1 font-bold",
                  isMajorWin
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                    : "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200"
                )}
              >
                <Check className="mr-1 inline size-3.5" aria-hidden />
                Case Won
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function InfiniteScrollTrack({
  cards,
  children,
}: {
  cards: NonNullable<FeatureCardCarouselProps["cards"]>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-20 group overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
      <div
        className="flex w-max shrink-0 flex-nowrap gap-3 py-4 animate-scroll [animation-play-state:running] group-hover:[animation-play-state:paused] sm:gap-4"
        style={{ animationDuration: "40s" }}
      >
        {children}
        {cards.map((card, index) => (
          <div
            className="shrink-0 px-2 sm:px-4"
            key={`dup-${card._key ?? index}`}
          >
            <VictoryCard card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeatureCardCarousel({
  eyebrow,
  title,
  description,
  cards,
  overallSummary,
}: FeatureCardCarouselProps) {
  const cardList = Array.isArray(cards) ? cards : [];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-hidden">
      <section
        className="py-8 sm:py-16"
        id="feature-card-carousel"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:mb-12">
          {eyebrow && (
            <Badge className="mb-2" variant="secondary">
              {eyebrow}
            </Badge>
          )}
          <h2 className="mb-3 font-bold text-2xl text-foreground sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <RichText
            className="mx-auto max-w-3xl px-2 text-base sm:text-lg"
            richText={description}
          />
        </div>

        {cardList.length > 0 && (
          <div className="relative">
            <InfiniteScrollTrack cards={cardList}>
              {cardList.map((card, index) => (
                <div
                  className="shrink-0 px-2 sm:px-4"
                  key={card._key ?? index}
                >
                  <VictoryCard card={card} />
                </div>
              ))}
            </InfiniteScrollTrack>
          </div>
        )}

        {overallSummary && (
          <div className="mt-8 flex justify-center sm:mt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary sm:px-6 sm:py-3 sm:text-base border border-primary/50">
              <span
                className="size-2 animate-pulse rounded-full bg-primary"
                aria-hidden
              />
              {overallSummary}
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
}
