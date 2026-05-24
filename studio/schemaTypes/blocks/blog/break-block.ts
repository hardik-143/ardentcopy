import { SeparatorHorizontalIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const breakBlock = defineType({
  name: "breakBlock",
  title: "Divider",
  type: "object",
  icon: SeparatorHorizontalIcon,
  fields: [
    defineField({
      name: "type",
      title: "Style",
      type: "string",
      options: {
        list: [
          { title: "Dots", value: "dots" },
          { title: "Line", value: "line" },
          { title: "Blank Space", value: "blank" },
        ],
        layout: "radio",
      },
      initialValue: "dots",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { type: "type" },
    prepare({ type }) {
      const labels: Record<string, string> = { dots: "··· Dots", line: "— Line", blank: "Blank Space" };
      return { title: labels[type] ?? "Divider" };
    },
  },
});
