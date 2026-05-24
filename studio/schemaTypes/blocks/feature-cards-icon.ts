import { LayoutGrid } from "lucide-react";
import { defineField, defineType } from "sanity";

import { lucideIconPreview } from "@studio/components/icon-preview";
import { anchorIdField, iconField } from "@studio/schemaTypes/common";
import { customRichText } from "@studio/schemaTypes/definitions/rich-text";

const featureCardIcon = defineField({
  name: "featureCardIcon",
  type: "object",
  fields: [
    iconField,
    defineField({
      name: "title",
      type: "string",
      description: "The heading text for this feature card",
    }),
    customRichText(["block"]),
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
    },
    prepare: ({ title, icon }) => ({
      title: `${title ?? "Untitled"}`,
      media: lucideIconPreview(icon),
    }),
  },
});

export const featureCardsIcon = defineType({
  name: "featureCardsIcon",
  type: "object",
  icon: LayoutGrid,
  description:
    "A grid of feature cards, each with an icon, title and description",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional text that appears above the main title",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The main heading for this feature section",
    }),
    customRichText(["block"]),
    defineField({
      name: "cards",
      type: "array",
      description: "The individual feature cards to display in the grid",
      of: [featureCardIcon],
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title,
      subtitle: "Feature Cards with Icon",
      media: LayoutGrid,
    }),
  },
});
