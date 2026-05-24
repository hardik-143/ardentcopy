import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { BriefcaseIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const career = defineType({
  name: "career",
  title: "Career",
  type: "document",
  icon: BriefcaseIcon,
  orderings: [orderRankOrdering],
  description:
    "A job opening or career opportunity with title, location, employment type, and description.",
  fields: [
    orderRankField({ type: "career" }),
    defineField({
      name: "name",
      type: "string",
      title: "Job Title",
      description: "The name or title of the position",
      validation: (Rule) => Rule.required().error("A job title is required"),
    }),
    defineField({
      name: "location",
      type: "string",
      title: "Location",
      description: "Where the position is based (e.g. city, remote, hybrid)",
    }),
    defineField({
      name: "employmentType",
      type: "string",
      title: "Employment Type",
      description: "Whether the role is full time or part time",
      options: {
        list: [
          { title: "Full Time", value: "full-time" },
          { title: "Part Time", value: "part-time" },
        ],
        layout: "radio",
      },
      validation: (Rule) =>
        Rule.required().error("Employment type is required"),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 6,
      description: "A clear description of the role and responsibilities",
      validation: (Rule) => Rule.required().error("A description is required"),
    }),
  ],
  preview: {
    select: {
      title: "name",
      location: "location",
      employmentType: "employmentType",
    },
    prepare: ({ title, location, employmentType }) => ({
      title: title || "Untitled Career",
      subtitle: [location, employmentType].filter(Boolean).join(" · ") || "—",
    }),
  },
});
