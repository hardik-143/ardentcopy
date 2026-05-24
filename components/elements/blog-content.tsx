import { cn } from "@/utils/ui/lib/utils";
import Link from "next/link";
import { PortableText, type PortableTextReactComponents, type PortableTextBlock } from "next-sanity";

import { convertToSlug } from "@/utils";
import { SanityImage } from "./sanity-image";
import type { SanityImageProps } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeadingLevel = "h2" | "h3" | "h4" | "h5" | "h6";

type BlogHeadingBlock = {
  _type: "headingBlock";
  _key: string;
  text: string;
  level: HeadingLevel;
};

type BlogParagraphBlock = {
  _type: "paragraphBlock";
  _key: string;
  content: PortableTextBlock[];
};

type BlogImageBlock = {
  _type: "imageBlock";
  _key: string;
  images: SanityImageProps[];
  caption?: string;
  size?: "small" | "medium" | "large" | "full";
};

type BlogVideoBlock = {
  _type: "videoBlock";
  _key: string;
  source: "youtube" | "vimeo" | "file";
  url?: string;
  fileUrl?: string;
  caption?: string;
};

type BlogQuoteBlock = {
  _type: "quoteBlock";
  _key: string;
  style: "default" | "info" | "tip" | "warning" | "danger";
  content: PortableTextBlock[];
};

type BlogTableBlock = {
  _type: "tableBlock";
  _key: string;
  title?: string;
  table?: { rows: { _key: string; cells: string[] }[] };
};

type BlogBreakBlock = {
  _type: "breakBlock";
  _key: string;
  breakType?: "dots" | "line" | "blank";
};

type BlogBlock =
  | BlogHeadingBlock
  | BlogParagraphBlock
  | BlogImageBlock
  | BlogVideoBlock
  | BlogQuoteBlock
  | BlogTableBlock
  | BlogBreakBlock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  for (const pattern of [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?/]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]) {
    const m = url.match(pattern);
    if (m?.[1]) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

// ─── Shared PortableText config (paragraphs + quotes) ─────────────────────────

const blogTextComponents: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => (
      <p className="leading-[1.78] [&:not(:last-child)]:mb-5">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 list-disc space-y-2 pl-6 text-foreground/90 marker:text-primary/60">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 list-decimal space-y-2 pl-6 text-foreground/90 marker:font-medium marker:text-primary/60">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1 leading-[1.78]">{children}</li>,
    number: ({ children }) => <li className="pl-1 leading-[1.78]">{children}</li>,
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded-md border border-border bg-muted/80 px-1.5 py-0.5 font-mono text-[0.9em] text-foreground dark:bg-muted/50">
        {children}
      </code>
    ),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      if (!href || href === "#") {
        return (
          <span className="cursor-default text-muted-foreground line-through decoration-destructive/50">
            Link Broken
          </span>
        );
      }
      const isExternal = value?.openInNewTab ?? href.startsWith("http");
      return (
        <Link
          aria-label={`Link to ${href}`}
          className="font-medium text-primary underline decoration-2 underline-offset-4 transition-colors hover:decoration-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={href}
          prefetch={false}
          rel={isExternal ? "noopener noreferrer" : undefined}
          target={value?.openInNewTab ? "_blank" : "_self"}
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    floatingImage: ({ value }) => {
      const img = value?.image as SanityImageProps | undefined;
      if (!img?.id) return null;
      const isLeft = value?.position !== "right";
      const maxWidth = (value?.maxWidth as number | undefined) ?? 200;
      return (
        <span
          className={cn(
            "block overflow-hidden rounded-lg",
            isLeft ? "float-left mr-6 mb-4" : "float-right ml-6 mb-4"
          )}
          style={{ maxWidth }}
        >
          <SanityImage className="h-auto w-full rounded-lg" height={400} image={img} width={400} />
        </span>
      );
    },
  },
  hardBreak: () => <br />,
};

// ─── Block renderers ──────────────────────────────────────────────────────────

const headingClasses: Record<HeadingLevel, string> = {
  h2: "scroll-m-24 mt-12 border-b border-border/80 pb-3 font-semibold tracking-tight text-3xl text-foreground first:mt-0",
  h3: "scroll-m-24 mt-10 font-semibold tracking-tight text-2xl text-foreground/95",
  h4: "scroll-m-24 mt-8 font-semibold tracking-tight text-xl text-foreground/95",
  h5: "scroll-m-24 mt-6 font-semibold text-lg text-foreground/95",
  h6: "scroll-m-24 mt-5 font-semibold text-base text-foreground/90 uppercase tracking-wider",
};

function HeadingBlock({ block }: { block: BlogHeadingBlock }) {
  const level = block.level ?? "h2";
  const id = convertToSlug(block.text);
  const className = headingClasses[level];
  if (level === "h3") return <h3 className={className} id={id}>{block.text}</h3>;
  if (level === "h4") return <h4 className={className} id={id}>{block.text}</h4>;
  if (level === "h5") return <h5 className={className} id={id}>{block.text}</h5>;
  if (level === "h6") return <h6 className={className} id={id}>{block.text}</h6>;
  return <h2 className={className} id={id}>{block.text}</h2>;
}

function ParagraphBlock({ block }: { block: BlogParagraphBlock }) {
  if (!block.content?.length) return null;
  return (
    <div className="clearfix">
      <PortableText components={blogTextComponents} value={block.content} />
    </div>
  );
}

const sizeClasses = {
  small: "max-w-sm mx-auto",
  medium: "max-w-xl mx-auto",
  large: "max-w-3xl mx-auto",
  full: "w-full",
};

function ImageBlockRenderer({ block }: { block: BlogImageBlock }) {
  const { images, caption, size = "medium" } = block;
  if (!images?.length) return null;

  if (images.length === 1) {
    const img = images[0];
    if (!img?.id) return null;
    return (
      <figure className={cn("my-10", sizeClasses[size])}>
        <div className="overflow-hidden rounded-xl shadow-lg shadow-black/5 ring-1 ring-border/50 dark:shadow-black/25">
          <SanityImage className="h-auto w-full" height={900} image={img} width={1600} />
        </div>
        {caption && (
          <figcaption className="mt-3 text-center text-sm tracking-wide text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-10">
      <div
        className={cn(
          "grid gap-3",
          images.length === 2 && "grid-cols-2",
          images.length >= 3 && "grid-cols-3"
        )}
      >
        {images.map((img, i) =>
          img?.id ? (
            <div
              key={i}
              className="overflow-hidden rounded-xl shadow-md shadow-black/5 ring-1 ring-border/50"
            >
              <SanityImage
                className="h-full w-full object-cover"
                height={600}
                image={img}
                width={800}
              />
            </div>
          ) : null
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm tracking-wide text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ block }: { block: BlogVideoBlock }) {
  const { source, url, fileUrl, caption } = block;

  let embed: React.ReactNode = null;

  if (source === "youtube" && url) {
    const id = getYouTubeId(url);
    if (id) {
      embed = (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={caption ?? "YouTube video"}
        />
      );
    }
  } else if (source === "vimeo" && url) {
    const id = getVimeoId(url);
    if (id) {
      embed = (
        <iframe
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          src={`https://player.vimeo.com/video/${id}`}
          title={caption ?? "Vimeo video"}
        />
      );
    }
  } else if (source === "file" && fileUrl) {
    embed = (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video className="h-full w-full rounded-xl" controls src={fileUrl} />
    );
  }

  if (!embed) return null;

  return (
    <figure className="my-10">
      <div
        className={cn(
          "overflow-hidden rounded-xl shadow-lg shadow-black/5 ring-1 ring-border/50",
          source !== "file" && "relative aspect-video"
        )}
      >
        {embed}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm tracking-wide text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const quoteStyles = {
  default: "border-primary/40 bg-muted/30",
  info:    "border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20",
  tip:     "border-green-500/40 bg-green-50/30 dark:bg-green-950/20",
  warning: "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20",
  danger:  "border-destructive/40 bg-destructive/5",
};

const quoteIcons: Record<string, string> = {
  default: "❝",
  info:    "ℹ",
  tip:     "💡",
  warning: "⚠",
  danger:  "⛔",
};

function QuoteBlock({ block }: { block: BlogQuoteBlock }) {
  if (!block.content?.length) return null;
  const style = block.style ?? "default";
  return (
    <blockquote
      className={cn(
        "my-8 border-s-4 py-1 pl-6 pr-4 font-serif italic text-muted-foreground [&>p]:mb-0",
        quoteStyles[style]
      )}
    >
      <span
        aria-hidden="true"
        className="mb-1 block text-lg not-italic opacity-60"
      >
        {quoteIcons[style]}
      </span>
      <PortableText components={blogTextComponents} value={block.content} />
    </blockquote>
  );
}

function TableBlockRenderer({ block }: { block: BlogTableBlock }) {
  const rows = block.table?.rows;
  if (!rows?.length) return null;

  return (
    <div className="my-10">
      {block.title && (
        <p className="mb-3 font-semibold text-foreground">{block.title}</p>
      )}
      <div className="w-full overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row._key ?? i}
                className="border-b border-border last:border-0 even:bg-muted/30"
              >
                {row.cells?.map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 text-foreground/90 first:font-medium"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BreakBlockRenderer({ block }: { block: BlogBreakBlock }) {
  const type = block.breakType ?? "dots";
  if (type === "line") {
    return <hr className="my-12 border-border/40" />;
  }
  if (type === "blank") {
    return <div className="h-8" />;
  }
  return (
    <p
      aria-hidden="true"
      className="my-12 text-center text-xl tracking-[0.5em] text-muted-foreground/50 select-none"
    >
      · · ·
    </p>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BlogContent({
  content,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any[] | null;
  className?: string;
}) {
  if (!content?.length) return null;

  return (
    <div className={cn("max-w-none text-[1.0625rem]", className)}>
      {(content as BlogBlock[]).map((block) => {
        switch (block._type) {
          case "headingBlock":
            return <HeadingBlock key={block._key} block={block} />;
          case "paragraphBlock":
            return <ParagraphBlock key={block._key} block={block} />;
          case "imageBlock":
            return <ImageBlockRenderer key={block._key} block={block} />;
          case "videoBlock":
            return <VideoBlock key={block._key} block={block} />;
          case "quoteBlock":
            return <QuoteBlock key={block._key} block={block} />;
          case "tableBlock":
            return <TableBlockRenderer key={block._key} block={block} />;
          case "breakBlock":
            return <BreakBlockRenderer key={block._key} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
