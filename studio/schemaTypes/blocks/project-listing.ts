import { LayoutGrid } from "lucide-react";
import { defineField, defineType } from "sanity";

export const projectListing = defineType({
  name: "projectListing",
  title: "Project Listing",
  icon: LayoutGrid,
  type: "object",
  fields: [
    defineField({
      name: "badge",
      type: "string",
      title: "Badge / Tag",
      description: "Optional label above the headline (e.g. 'Our Work')",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Heading",
      description: "Main heading for the section",
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
      description: "Supporting text below the heading",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Project Listing",
      subtitle: "Project Listing Block",
      media: LayoutGrid,
    }),
  },
});
