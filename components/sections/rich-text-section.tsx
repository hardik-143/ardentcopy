"use client";

import type { PortableTextBlock } from "next-sanity";

import type { PagebuilderType } from "@/types";
import CustomPortableText from "../PortableTextComponents/PortableText";

type RichTextSectionProps = PagebuilderType<"richTextSection">;

export function RichTextSectionBlock({ richText }: RichTextSectionProps) {
  if (!richText?.length) return null;

  return (
    <section className="my-6 md:my-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto overflow-hidden">
          <CustomPortableText value={richText as PortableTextBlock[]} />
        </div>
      </div>
    </section>
  );
}
