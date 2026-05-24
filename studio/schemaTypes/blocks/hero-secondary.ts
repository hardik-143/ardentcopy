import { Star } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField, buttonsField, imageWithAltField } from "@studio/schemaTypes/common";

export const heroSecondary = defineType({
  name: "heroSecondary",
  title: "Hero Secondary",
  icon: Star,
  type: "object",
  fields: [
    defineField({
      name: "badge",
      type: "string",
      title: "Badge / Tag",
      description: "Optional pill-shaped label above the headline",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Headline",
      description: "Main headline text",
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
      description: "Optional supporting text below the headline",
    }),
    imageWithAltField({
      name: "image",
      title: "Background Image",
      description: "Background image for the hero section",
    }),
    buttonsField,
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Hero Secondary",
      subtitle: "Hero Secondary Block",
      media: Star,
    }),
  },
});
