"use client";

import { Badge } from "@/utils/ui/components/badge";
import { Button } from "@/utils/ui/components/button";
import Link from "next/link";

import type { PagebuilderType, SanityImageProps } from "@/types";
import { SanityImage } from "../elements/sanity-image";
import { sanitizeText } from "@/textSanitizer";
import { stegaClean } from "next-sanity";

type HeroSecondaryBlockProps = PagebuilderType<"heroSecondary">;

const heroGradientOverlays = {
  white: "linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2))",
  black: "linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))",
} as const;

export function HeroSecondaryBlock({
  badge,
  title,
  subtitle,
  image,
  buttons,
}: HeroSecondaryBlockProps) {
  
  return (
    <section
      className="relative flex min-h-[870px] w-screen max-w-none items-center overflow-hidden [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)]"
      id="hero-secondary"
    >
      {image?.id && (
        <div className="absolute inset-0 z-0">
          <SanityImage
            className="h-full w-full object-cover"
            image={image as SanityImageProps}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 py-16 md:px-12">
        <div className="max-w-4xl">
          {badge && (
            <Badge
              className="mb-6 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary text-sm font-medium"
              variant="outline"
            >
              {badge}
            </Badge>
          )}

          {title && (
            <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl lg:text-6xl">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mb-10 max-w-xl text-lg text-muted-foreground md:text-xl">
              {subtitle}
            </p>
          )}

          {buttons && buttons.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row">
              {buttons.map((button) => (
                <Button
                  key={button._key}
                  asChild
                  className="rounded-xl shadow-lg hover:shadow-xl"
                  variant={button.variant ?? "default"}
                  size="lg"
                >
                  <Link
                    href={stegaClean(button.href ?? "#")}
                    target={button.openInNewTab ? "_blank" : undefined}
                    rel={
                      button.openInNewTab ? "noopener noreferrer" : undefined
                    }
                  >
                    {button.text}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
