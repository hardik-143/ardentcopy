import { Heading2Icon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const headingBlock = defineType({
  name: "headingBlock",
  title: "Heading",
  type: "object",
  icon: Heading2Icon,
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      options: {
        list: [
          { title: "H2", value: "h2" },
          { title: "H3", value: "h3" },
          { title: "H4", value: "h4" },
          { title: "H5", value: "h5" },
          { title: "H6", value: "h6" },
        ],
        layout: "radio",
      },
      initialValue: "h2",
    }),
  ],
  preview: {
    select: {
      title: "text",
      level: "level",
    },
    prepare({ title, level }) {
      return {
        title: title || "Untitled Heading",
        subtitle: level?.toUpperCase() ?? "H2",
      };
    },
  },
});
