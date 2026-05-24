import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SanityImage } from "@/components/elements/sanity-image";

type AuthorImage = {
  id: string | null;
  preview: string | null;
  alt: string | "untitled";
  hotspot: { x: number; y: number } | null;
  crop: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  } | null;
};

type Author = {
  name: string;
  image: AuthorImage | null;
};

type BlogArticleTopBarProps = {
  author?: Author | null;
  publishedAt?: string | null;
};

function getAuthorInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BlogArticleTopBar({
  author,
  publishedAt,
}: BlogArticleTopBarProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const authorInitials = author?.name ? getAuthorInitials(author.name) : null;

  return (
    <div
      aria-label="Article navigation"
      className="flex w-full items-center justify-between px-2 py-8"
    >
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span className="text-sm">Back</span>
      </Link>
      <div className="flex flex-nowrap items-center gap-2">
        {(author ?? formattedDate) && (
          <>
            {author && (
              <div className="flex min-w-0 shrink-0 items-center gap-2">
                <div className="size-5 shrink-0 overflow-hidden rounded-full">
                  {author.image?.id ? (
                    <SanityImage
                      alt={author.name ?? "Author"}
                      className="size-full object-cover"
                      height={20}
                      image={author.image}
                      width={20}
                    />
                  ) : authorInitials ? (
                    <span
                      className="flex size-full items-center justify-center rounded-full bg-emerald-800 font-medium text-emerald-100 text-xs"
                      title={author.name ?? undefined}
                    >
                      {authorInitials}
                    </span>
                  ) : null}
                </div>
                <span className="text-foreground truncate text-sm font-normal">
                  {author.name}
                </span>
              </div>
            )}
            {author && formattedDate && (
              <div
                aria-hidden
                className="bg-border h-5 w-0.5 shrink-0 rounded-lg"
              />
            )}
            {formattedDate && (
              <time
                className="text-muted-foreground shrink-0 text-sm"
                dateTime={publishedAt ?? undefined}
              >
                {formattedDate}
              </time>
            )}
          </>
        )}
      </div>
    </div>
  );
}
