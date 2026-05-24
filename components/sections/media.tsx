import type { PagebuilderType, SanityImageProps } from "@/types";
import { SanityImage } from "../elements/sanity-image";

export type MediaBlockProps = PagebuilderType<"media">;

export function MediaBlock({
  mediaType,
  image,
  video,
}: MediaBlockProps) {
  if (mediaType === "image" && image?.id) {
    return (
      <section className="my-6 md:my-16">
        <div className="container mx-auto px-4">
          <figure className="mx-auto max-w-4xl overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50">
            <SanityImage
              className="h-auto w-full"
              height={560}
              image={image as SanityImageProps}
              width={960}
            />
            {image.caption && (
              <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                {image.caption}
              </figcaption>
            )}
          </figure>
        </div>
      </section>
    );
  }

  if (mediaType === "video" && video?.videoUrl) {
    return (
      <section className="my-6 md:my-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50">
            <video
              className="h-auto w-full"
              controls
              playsInline
              preload="metadata"
              title="Video content"
            >
              <source src={video.videoUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
