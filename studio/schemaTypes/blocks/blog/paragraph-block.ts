import { AlignLeftIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { createBlogBlock, floatingImageBlock } from "@studio/utils/custom-block";

export const paragraphBlock = defineType({
  name: "paragraphBlock",
  title: "Rich Text",
  type: "object",
  icon: AlignLeftIcon,
  fields: [
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [createBlogBlock(), floatingImageBlock],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      content: "content",
    },
    prepare({ content }) {
      const text = Array.isArray(content)
        ? content
            .map((block: { children?: { text?: string }[] }) =>
              Array.isArray(block.children)
                ? block.children.map((c) => c?.text ?? "").join("")
                : ""
            )
            .join(" ")
            .trim()
        : "";
      const preview = text.length > 60 ? text.slice(0, 60) + "…" : text;
      return {
        title: preview || "Empty paragraph",
        subtitle: "Rich Text",
      };
    },
  },
});
