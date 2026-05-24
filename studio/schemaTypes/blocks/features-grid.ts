import { LayoutGrid } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { lucideIconPreview } from "@studio/components/icon-preview";
import { anchorIdField, iconField } from "@studio/schemaTypes/common";
import { customRichText } from "@studio/schemaTypes/definitions/rich-text";

const featureBlockMember = defineArrayMember({
  name: "featureBlock",
  type: "object",
  fields: [
    iconField,
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Bold title for this feature",
      validation: (rule) => rule.required(),
    }),
    customRichText(["block"], {
      name: "body",
      title: "Body",
      description: "Description text for this feature",
    }),
  ],
  preview: {
    select: { title: "heading", icon: "icon" },
    prepare({ title, icon }) {
      return {
        title: title ?? "Untitled feature",
        subtitle: "Feature block",
        media: lucideIconPreview(icon),
      };
    },
  },
});

export const featuresGrid = defineType({
  name: "featuresGrid",
  title: "Features Grid",
  type: "object",
  icon: LayoutGrid,
  description:
    "Two-column layout: main heading on the left, grid of feature blocks on the right with optional disclaimer",
  fields: [
    defineField({
      name: "mainTitle",
      title: "Main title",
      type: "string",
      description: "Primary heading displayed on the left",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      description: "Feature blocks shown in a 2x2 grid (typically 4 items)",
      of: [featureBlockMember],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "showNumbers",
      title: "Show numbers on cards",
      type: "boolean",
      description:
        "When enabled, cards without an icon display their order number (1, 2, 3…) in a circle. When disabled, only cards with an icon show the circle.",
      initialValue: false,
    }),
    defineField({
      name: "disclaimer",
      title: "Disclaimer",
      type: "string",
      description: "Optional small disclaimer text below the grid",
    }),
    anchorIdField,
  ],
  preview: {
    select: { title: "mainTitle" },
    prepare({ title }) {
      return {
        title: title ?? "Features Grid",
        subtitle: "Features Grid",
        media: LayoutGrid,
      };
    },
  },
});
