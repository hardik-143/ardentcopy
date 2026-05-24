import { Logger } from "@/utils/logger";
import { cn } from "@/utils/ui/lib/utils";
import Link from "next/link";
import { PortableText, type PortableTextReactComponents } from "next-sanity";

import type { SanityRichTextProps } from "@/types";
import { parseChildrenToSlug } from "@/utils";
import { SanityImage } from "./sanity-image";

const logger = new Logger("RichText");

const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => (
      <p className="leading-[1.78] [&:not(:last-child)]:mb-5">
        {children}
      </p>
    ),
    h2: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h2
          className="scroll-m-24 mt-12 border-b border-border/80 pb-3 font-semibold tracking-tight text-3xl text-foreground first:mt-0"
          id={slug}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h3
          className="scroll-m-24 mt-10 font-semibold tracking-tight text-2xl text-foreground/95"
          id={slug}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h4
          className="scroll-m-24 mt-8 font-semibold tracking-tight text-xl text-foreground/95"
          id={slug}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h5
          className="scroll-m-24 mt-6 font-semibold text-lg text-foreground/95"
          id={slug}
        >
          {children}
        </h5>
      );
    },
    h6: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h6
          className="scroll-m-24 mt-5 font-semibold text-base text-foreground/90 uppercase tracking-wider"
          id={slug}
        >
          {children}
        </h6>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-s-4 border-primary/40 bg-muted/30 py-1 pl-6 pr-4 font-serif italic text-muted-foreground [&>p]:mb-0">
        {children}
      </blockquote>
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
    bullet: ({ children }) => (
      <li className="pl-1 leading-[1.78]">{children}</li>
    ),
    number: ({ children }) => (
      <li className="pl-1 leading-[1.78]">{children}</li>
    ),
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded-md border border-border bg-muted/80 px-1.5 py-0.5 font-mono text-[0.9em] text-foreground dark:bg-muted/50">
        {children}
      </code>
    ),
    customLink: ({ children, value }) => {
      if (!value.href || value.href === "#") {
        return (
          <span className="cursor-default text-muted-foreground line-through decoration-destructive/50">
            Link Broken
          </span>
        );
      }
      const isExternal = value.openInNewTab ?? value.href.startsWith("http");
      return (
        <Link
          aria-label={`Link to ${value?.href}`}
          className="font-medium text-primary underline decoration-2 underline-offset-4 transition-colors hover:decoration-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={value.href}
          prefetch={false}
          rel={isExternal ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : "_self"}
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.id) {
        return null;
      }
      return (
        <figure className="my-10">
          <div className="overflow-hidden rounded-xl shadow-lg shadow-black/5 ring-1 ring-border/50 dark:shadow-black/25">
            <SanityImage
              className="h-auto w-full"
              height={900}
              image={value}
              width={1600}
            />
          </div>
          {value?.caption && (
            <figcaption className="mt-3 text-center text-sm tracking-wide text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  hardBreak: () => <br />,
};

export function RichText<T extends SanityRichTextProps>({
  richText,
  className,
}: {
  richText?: T | null;
  className?: string;
}) {
  if (!richText) {
    return null;
  }

  return (
    <div
      className={cn(
        "max-w-none text-[1.0625rem]",
        "prose-headings:scroll-m-24",
        className
      )}
    >
      <PortableText
        components={components}
        onMissingComponent={(_, { nodeType, type }) => {
          logger.warn(`Missing component: ${nodeType} for type: ${type}`);
        }}
        value={richText}
      />
    </div>
  );
}
