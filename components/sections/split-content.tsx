"use client";

import { cn } from "@/utils/ui/lib/utils";

import type {
  PagebuilderType,
  SanityImageProps,
  SanityRichTextProps,
} from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityImage } from "../elements/sanity-image";

export type SplitContentProps = PagebuilderType<"splitContent">;

function MediaColumn({
  media,
}: {
  media?: SplitContentProps["media"];
}) {
  const item = media?.at(0);
  if (!item) {
    return null;
  }

  if (item._type === "image" && item.id) {
    return (
      <figure className="overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50">
        <SanityImage
          className="h-auto w-full"
          height={560}
          image={item}
          width={800}
        />
        {item.caption && (
          <figcaption className="mt-3 text-center text-sm text-muted-foreground">
            {item.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (item._type === "video" && "videoUrl" in item && item.videoUrl) {
    return (
      <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50">
        <video
          className="h-auto w-full"
          controls
          playsInline
          preload="metadata"
          title="Video content"
        >
          <source src={item.videoUrl} type="video/mp4" />
        </video>
      </div>
    );
  }

  return null;
}

export function SplitContent({
  title,
  content,
  mediaPosition = "right",
  media,
}: SplitContentProps) {
  const mediaLeft = mediaPosition === "left";

  return (
    <section className="my-6 md:my-16">
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-start",
            mediaLeft && "lg:grid-flow-dense"
          )}
        >
          <div
            className={cn(
              "mx-auto w-full max-w-2xl lg:max-w-none",
              mediaLeft && "lg:col-start-2"
            )}
          >
            {title && (
              <h2 className="mb-6 font-semibold text-3xl md:text-4xl">
                {title}
              </h2>
            )}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <RichText richText={content as SanityRichTextProps} />
            </div>
          </div>
          <div
            className={cn(
              "flex w-full items-start justify-center",
              mediaLeft && "lg:col-start-1 lg:row-start-1"
            )}
          >
            <MediaColumn media={media} />
          </div>
        </div>
      </div>
    </section>
  );
}
