import { AlignLeft } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";
import { buttonBlock, buttonsGroupBlock, createCustomBlock, floatingImageBlock, inlineContentSectionBlock, singleImageBlock } from "@studio/utils/customBlock";

export const richTextSection = defineType({
  name: "richTextSection",
  title: "Rich Text Section",
  type: "object",
  icon: AlignLeft,
  fields: [
    defineField({
      name: "richText",
      title: "Rich Text",
      type: "array",
      of: [
        createCustomBlock({
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          highlight: true,
          normal: true,
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          blockquote: true,
          ul: true,
          ol: true,
          link: true,
          floatingImage: true,
          button: true,
          inlineContentSection: true,
          singleImage: true,
        }),
        floatingImageBlock,
        buttonBlock,
        buttonsGroupBlock,
        inlineContentSectionBlock,
        singleImageBlock,
      ],
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      richText: "richText",
    },
    prepare: ({ richText }) => {
      const firstBlock = Array.isArray(richText)
        ? richText.find((b: { _type?: string }) => b._type === "block")
        : null;
      const text =
        firstBlock?.children
          ?.map((c: { text?: string }) => c.text)
          .filter(Boolean)
          .join(" ") ?? "";
      return {
        title: text || "Rich Text Section",
        subtitle: "Rich Text Section",
        media: AlignLeft,
      };
    },
  },
});
