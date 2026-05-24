import { NewspaperIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";

export const latestBlogPosts = defineType({
  name: "latestBlogPosts",
  type: "object",
  icon: NewspaperIcon,
  title: "Latest Blog Posts",
  description:
    "Displays the most recent blog posts in a grid. Configure the section title and how many posts to show.",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Heading shown above the blog posts (e.g. Latest from our blog)",
      initialValue: () => "Latest from our blog",
    }),
    defineField({
      name: "highlightedText",
      title: "Highlighted Text",
      type: "string",
      description:
        "Optional part of the title to highlight (e.g. our blog). Must appear in the section title above.",
    }),
    defineField({
      name: "count",
      title: "Number of posts",
      type: "number",
      description: "How many latest posts to display (1–12)",
      initialValue: () => 3,
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(12)
          .error("Choose a number between 1 and 12"),
    }),
    defineField({
      name: "viewAllUrl",
      title: "View all link",
      type: "customUrl",
      description: "Optional link to the blog index (e.g. View all posts)",
    }),
    defineField({
      name: "viewAllText",
      title: "View all link text",
      type: "string",
      description: "Text for the link (e.g. View all posts)",
      initialValue: () => "View all posts",
      hidden: ({ parent }) => !parent?.viewAllUrl,
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
      highlightedText: "highlightedText",
      count: "count",
    },
    prepare: ({ title, highlightedText, count }) => ({
      title: title || "Latest Blog Posts",
      subtitle: [
        highlightedText ? `Highlight: "${highlightedText}"` : null,
        `Shows ${count ?? 3} most recent posts`,
      ]
        .filter(Boolean)
        .join(" · "),
      media: NewspaperIcon,
    }),
  },
});
