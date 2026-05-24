import { QuoteIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { createBlogBlock } from "@studio/utils/custom-block";

export const quoteBlock = defineType({
  name: "quoteBlock",
  title: "Callout / Quote",
  type: "object",
  icon: QuoteIcon,
  fields: [
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Info", value: "info" },
          { title: "Tip", value: "tip" },
          { title: "Warning", value: "warning" },
          { title: "Danger", value: "danger" },
        ],
        layout: "radio",
      },
      initialValue: "default",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [createBlogBlock({ ol: false })],
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
  ],
  preview: {
    select: {
      style: "style",
      content: "content",
    },
    prepare({ style, content }) {
      const text = Array.isArray(content)
        ? content
            .map((b: { children?: { text?: string }[] }) =>
              Array.isArray(b.children) ? b.children.map((c) => c?.text ?? "").join("") : ""
            )
            .join(" ")
            .trim()
        : "";
      const preview = text.length > 50 ? text.slice(0, 50) + "…" : text;
      return {
        title: preview || "Callout",
        subtitle: style ? style.charAt(0).toUpperCase() + style.slice(1) : "Default",
      };
    },
  },
});
