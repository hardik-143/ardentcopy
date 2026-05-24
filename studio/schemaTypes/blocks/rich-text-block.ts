import { TextIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";
import { customRichText } from "@studio/schemaTypes/definitions/rich-text";

export const richTextBlock = defineType({
  name: "richTextBlock",
  title: "Rich Text Block",
  type: "object",
  icon: TextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Optional heading displayed above the content",
    }),
    customRichText(["block", "image"], {
      name: "content",
      title: "Content",
      description: "The main rich text content with support for headings, lists, links, and images",
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Rich Text Block",
      subtitle: "Rich Text",
      media: TextIcon,
    }),
  },
});
