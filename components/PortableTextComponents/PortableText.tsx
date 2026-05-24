"use client";

import React, { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
  stegaClean,
} from "next-sanity";
import { sanitizeTagName, sanitizeText } from "@/textSanitizer";
import Image from "next/image";
import { SanityImage } from "@/components/elements/sanity-image";
import type { SanityImageProps } from "@/types";
import { Button } from "@/utils/ui/components/button";
import type { ButtonVariant, ButtonSize } from "@/utils/ui/components/button";
import { cn } from "@/utils/ui/lib/utils";

interface AnchorMarkValue {
  _type: string;
  _key: string;
  href?: string;
}

interface HighlightMarkValue {
  _type: "highlight";
  _key: string;
  color?: string;
  highlightClassName?: string;
}

interface LinkMarkValue {
  _type: "link";
  _key: string;
  type?: "internal" | "external" | "section";
  href?: string;
  openInNewTab?: boolean;
}

interface SanityImageValue {
  asset?: { url?: string };
  alt?: string;
  caption?: string;
}

interface ButtonValue {
  _type: "button";
  _key?: string;
  text?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  openInNewTab?: boolean;
}

interface ButtonsGroupValue {
  _type: "buttonsGroup";
  buttons?: ButtonValue[];
}

interface SingleImageValue {
  _type: "singleImage";
  width?: "full" | "75" | "50" | "25";
  captionAlignment?: "left" | "center" | "right";
  caption?: PortableTextBlock[];
  image?: {
    id?: string;
    alt?: string;
    hotspot?: { x: number; y: number };
    crop?: { bottom: number; left: number; right: number; top: number };
  };
}

interface FloatingImageValue {
  _type: "floatingImage";
  position?: "left" | "right";
  maxWidth?: number;
  image?: {
    id?: string;
    alt?: string;
    hotspot?: { x: number; y: number };
    crop?: { bottom: number; left: number; right: number; top: number };
  };
}

interface InlineContentSectionValue {
  _type: "inlineContentSection";
  imagePosition?: "left" | "right";
  image?: {
    id?: string;
    alt?: string;
    hotspot?: { x: number; y: number };
    crop?: { bottom: number; left: number; right: number; top: number };
  };
  description?: PortableTextBlock[];
}

interface CustomPortableTextProps {
  value: PortableTextBlock[];
  elementOverrides?: { [key: string]: keyof HTMLElementTagNameMap };
  elementClass?: string;
  elementClassObj?: {
    [key in keyof HTMLElementTagNameMap]?: string;
  };
  extractText?: boolean;
  highlightClassName?: string;
}

const CustomPortableText = memo(function CustomPortableText({
  value,
  extractText: _extractText = false,
  elementClassObj,
  elementOverrides = {},
  elementClass = "",
  highlightClassName = "",
}: CustomPortableTextProps) {
  const getElement = useCallback(
    (tag: keyof HTMLElementTagNameMap) => {
      const resolvedTag = elementOverrides[tag] ?? tag;
      const safeName = sanitizeTagName(resolvedTag, tag);
      return {
        name: safeName,
        className: elementClassObj ? (elementClassObj[tag] ?? "") : "",
      };
    },
    [elementOverrides, elementClassObj],
  );

  const components = useMemo<PortableTextComponents>(
    () => ({
      block: {
        h1: ({ children }) => {
          const Tag = getElement("h1");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        h2: ({ children }) => {
          const Tag = getElement("h2");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        h3: ({ children }) => {
          const Tag = getElement("h3");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        h4: ({ children }) => {
          const Tag = getElement("h4");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        h5: ({ children }) => {
          const Tag = getElement("h5");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        h6: ({ children }) => {
          const Tag = getElement("h6");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        normal: ({ children }) => {
          const Tag = getElement("p");
          const Component = Tag.name as React.ElementType;
          return (
            <Component className={`${elementClass} ${Tag.className}`}>
              {children}
            </Component>
          );
        },
        blockquote: ({ children }) => (
          <blockquote
            className={`border-l-4 border-gray-300 pl-4 italic ${elementClass}`}
          >
            {children}
          </blockquote>
        ),
      },

      marks: {
        strong: ({ children }) => (
          <strong
            className={`font-750 ${elementClass} ${elementClassObj?.strong}`}
          >
            {children}
          </strong>
        ),
        em: ({ children }) => <em className={elementClass}>{children}</em>,
        underline: ({ children }) => (
          <span className={`underline ${elementClass}`}>{children}</span>
        ),
        "strike-through": ({ children }) => (
          <span className={`line-through ${elementClass}`}>{children}</span>
        ),
        highlight: ({ children, value }) => {
          const highlight = value as HighlightMarkValue | undefined;
          const resolvedHighlightClassName =
            highlight?.highlightClassName ?? highlightClassName;
          return (
            <span
              className={resolvedHighlightClassName}
              style={{ color: highlight?.color ?? "#c4d600" }}
            >
              {children}
            </span>
          );
        },
        link: ({ children, value }) => {
          const link = value as LinkMarkValue | undefined;
          if (!link) return <>{children}</>;

          const isExternal = link.type === "external";
          const isSection = link.type === "section";
          const openInNewTab = link.openInNewTab === true;
          const href = stegaClean(link.href ?? "#");
          const linkClass =
            `underline underline-offset-2 text-primary text-nowrap ${elementClass} ${elementClassObj?.a ?? ""}`.trim();

          if (isExternal || isSection) {
            return (
              <a
                href={href}
                className={linkClass}
                target={openInNewTab ? "_blank" : undefined}
                rel={openInNewTab ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          }

          return (
            <Link
              href={href}
              className={linkClass}
              prefetch={false}
              target={openInNewTab ? "_blank" : undefined}
              rel={openInNewTab ? "noopener noreferrer" : undefined}
            >
              {children}
            </Link>
          );
        },
        // Legacy anchor support
        anchor: ({ children, value }) => {
          const anchor = value as AnchorMarkValue | undefined;
          const href = stegaClean(anchor?.href ?? "#");
          const linkClass =
            `underline underline-offset-2 text-primary ${elementClass} ${elementClassObj?.a ?? ""}`.trim();
          return (
            <a
              href={href}
              className={linkClass}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          );
        },
      },

      types: {
        image: ({ value }) => {
          const image = value as SanityImageValue;
          const src = image?.asset?.url;
          if (!src) return null;

          return (
            <figure className="my-4">
              <Image
                src={src}
                alt={image.alt ?? "Inline image"}
                className="h-auto w-full rounded-lg"
                unoptimized
                loading="lazy"
                fetchPriority="high"
              />
              {image.caption ? (
                <figcaption className="mt-2 text-sm text-gray-500">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        },
        button: ({ value }) => {
          const btn = value as ButtonValue;
          if (!btn?.text) return null;
          const href = stegaClean(btn.href ?? "#");
          return (
            <div className="my-4">
              <Button
                variant={btn.variant ? sanitizeText(btn.variant) as ButtonValue["variant"] : "default"}
                size={btn.size ? sanitizeText(btn.size) as ButtonValue['size']: "default"}
              >
                <Link
                  href={href}
                  target={btn.openInNewTab ? "_blank" : undefined}
                  rel={btn.openInNewTab ? "noopener noreferrer" : undefined}
                >
                  {btn.text}
                </Link>
              </Button>
            </div>
          );
        },
        buttonsGroup: ({ value }) => {
          const group = value as ButtonsGroupValue;
          if (!group?.buttons?.length) return null;
          return (
            <div className="my-4 flex flex-wrap gap-3">
              {group.buttons.map((btn) => {
                if (!btn?.text) return null;
                const href = stegaClean(btn.href ?? "#");
                return (
                  <Button
                    key={btn._key ?? btn.text}
                    variant={btn.variant ? sanitizeText(btn.variant) as ButtonValue["variant"] : "default"}
                    size={btn.size ? sanitizeText(btn.size) as ButtonValue["size"] : "default"}
                    asChild
                  >
                    <Link
                      href={href}
                      target={btn.openInNewTab ? "_blank" : undefined}
                      rel={btn.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {btn.text}
                    </Link>
                  </Button>
                );
              })}
            </div>
          );
        },
        singleImage: ({ value }) => {
          const item = value as SingleImageValue;
          if (!item?.image?.id) return null;
          const widthMap: Record<string, string> = {
            full: "100%",
            "75": "75%",
            "50": "50%",
            "25": "25%",
          };
          const cssWidth = widthMap[item.width ?? "full"] ?? "100%";
          const alignment = item.captionAlignment ?? "left";
          return (
            <figure style={{ width: cssWidth, margin: "1rem auto" }}>
              <SanityImage
                image={item.image as SanityImageProps}
                alt={item.image.alt ?? ""}
                className="h-auto w-full rounded-lg object-cover"
              />
              {item.caption && item.caption.length > 0 && (
                <figcaption style={{ textAlign: alignment }}>
                  <CustomPortableText
                    value={item.caption}
                    elementClass="text-sm text-gray-500 italic mt-1"
                  />
                </figcaption>
              )}
            </figure>
          );
        },
        floatingImage: ({ value }) => {
          const item = value as FloatingImageValue;
          if (!item?.image?.id) return null;
          const position = item.position ? sanitizeText(item.position) as "left" | "right" : "left";
          const maxWidth = item.maxWidth ? sanitizeText(item.maxWidth.toString()) : 200;
          return (
            <div
              style={{
                float: position,
                marginRight: position === "left" ? "1.5rem" : 0,
                marginLeft: position === "right" ? "1.5rem" : 0,
                marginBottom: "1rem",
                maxWidth: `${maxWidth}px`,
              }}
            >
              <SanityImage
                image={item.image as SanityImageProps}
                alt={item.image.alt ?? ""}
                className="h-auto w-full rounded-lg object-contain"
              />
            </div>
          );
        },
        inlineContentSection: ({ value }) => {
          const item = value as InlineContentSectionValue;
          if (!item?.image?.id) return null;
          const imageLeft = (item.imagePosition ?? "left") === "left";
          return (
            <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-5 md:items-start">
              <div className={cn("md:col-span-2", imageLeft ? "md:order-first" : "md:order-last")}>
                <SanityImage
                  image={item.image as SanityImageProps}
                  alt={item.image.alt ?? ""}
                  className="h-auto w-full rounded-lg object-cover"
                />
              </div>
              <div className={cn("md:col-span-3", imageLeft ? "md:order-last" : "md:order-first")}>
                {item.description && item.description.length > 0 && (
                  <CustomPortableText value={item.description} />
                )}
              </div>
            </div>
          );
        },
      },

      list: {
        bullet: ({ children }) => (
          <ul className={`${elementClass} ${elementClassObj?.ul ?? ""}`}>
            {children}
          </ul>
        ),
        number: ({ children }) => (
          <ol className={`${elementClass} ${elementClassObj?.ol ?? ""}`}>
            {children}
          </ol>
        ),
      },
      listItem: {
        bullet: ({ children }) => (
          <li
            className={`bullet-list ${elementClass} ${elementClassObj?.li ?? ""}`}
          >
            {children}
          </li>
        ),
        number: ({ children }) => (
          <li
            className={`numbered-list ${elementClass} ${elementClassObj?.li ?? ""}`}
          >
            {children}
          </li>
        ),
      },

      hardBreak: () => <br />,
    }),
    [elementClass, elementClassObj, getElement, highlightClassName],
  );

  return <PortableText value={value} components={components} />;
});

CustomPortableText.displayName = "CustomPortableText";

export default CustomPortableText;
