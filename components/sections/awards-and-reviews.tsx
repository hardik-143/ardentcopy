import { Button } from "@/utils/ui/components/button";
import Link from "next/link";
import { stegaClean } from "next-sanity";

import type { SanityImageProps } from "@/types";
import { SanityImage } from "../elements/sanity-image";

type AwardsAndReviewsProps = {
  _type: "awardsAndReviews";
  _key: string;
  title?: string | null;
  awardsTitle?: string | null;
  awardImages?: Array<SanityImageProps & { id: string }> | null;
  buttonText?: string | null;
  buttonVariant?: string | null;
  buttonHref?: string | null;
  buttonOpenInNewTab?: boolean | null;
  // reviewsTitle?: string | null;
  // reviewsEmbedCode?: string | null;
};

export function AwardsAndReviewsBlock({
  title,
  awardsTitle,
  awardImages,
  buttonText,
  buttonVariant,
  buttonHref,
  buttonOpenInNewTab,
}: AwardsAndReviewsProps) {
  return (
    <section className="bg-primary py-14 text-primary-foreground md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {title && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
            <div className="mt-3 h-px w-24 bg-secondary" />
          </div>
        )}

        <div className="flex flex-col gap-8">
          {awardsTitle && (
            <h3 className="text-xl font-semibold">{awardsTitle}</h3>
          )}

          {awardImages && awardImages.length > 0 && (
            <div className="flex flex-wrap items-center gap-6">
              {awardImages.map((img) => (
                <div
                  className="relative h-28 w-28 shrink-0 overflow-hidden"
                  key={img.id}
                >
                  <SanityImage
                    className="h-full w-full object-contain"
                    height={112}
                    image={img as SanityImageProps}
                    width={112}
                  />
                </div>
              ))}
            </div>
          )}

          {buttonHref && buttonText && (
            <div className="mt-2">
              <Button
                asChild
                variant={
                  (buttonVariant as
                    | "default"
                    | "secondary"
                    | "outline"
                    | "ghost"
                    | "link"
                    | "destructive"
                    | null
                    | undefined) ?? "outline"
                }
              >
                <Link
                  href={stegaClean(buttonHref)}
                  rel={buttonOpenInNewTab ? "noopener noreferrer" : undefined}
                  target={buttonOpenInNewTab ? "_blank" : undefined}
                >
                  {buttonText}
                </Link>
              </Button>
            </div>
          )}

          {/* TODO: reviews column — add embed widget here when ready */}
        </div>
      </div>
    </section>
  );
}
