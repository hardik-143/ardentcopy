import { lucideIconPreview } from "@studio/components/icon-preview";
import { ServiceCardColorInput } from "@studio/components/service-card-color-input";
import {
  anchorIdField,
  iconField,
  imageWithAltField,
} from "@studio/schemaTypes/common";
import { Layers } from "lucide-react";
import { defineField, defineType } from "sanity";

const serviceCard = defineField({
  name: "serviceCard",
  type: "object",
  fields: [
    iconField,
    defineField({
      name: "color",
      title: "Accent Color",
      type: "string",
      description:
        "Hex color used for the icon and the full-card hover overlay.",
      components: {
        input: ServiceCardColorInput,
      },
      initialValue: () => "#39bfd6",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
            ? true
            : "Enter a valid hex color like #39bfd6";
        }),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description:
        "Short uppercase-style label above the card title (e.g. Protect your carpet's warranty)",
    }),
    defineField({
      name: "title",
      title: "Card Heading",
      type: "string",
      description: "Main heading for this service",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Short description of the service",
      validation: (Rule) => Rule.required(),
    }),
    imageWithAltField({
      name: "image",
      title: "Background Image",
      description:
        "Large background image used behind this service card. Use a wide image for the best crop.",
    }),
    defineField({
      name: "linkText",
      title: "Link Text",
      type: "string",
      description:
        "Optional accessibility label for the card link. This is not shown visually in the new card design.",
      initialValue: () => "Learn more",
    }),
    defineField({
      name: "url",
      title: "Link URL",
      type: "customUrl",
      description: "Where the link goes",
    }),
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
    },
    prepare: ({ title, icon }) => ({
      title: title ?? "Untitled",
      media: lucideIconPreview(icon),
    }),
  },
});

export const serviceCards = defineType({
  name: "serviceCards",
  type: "object",
  icon: Layers,
  title: "Service Cards",
  description:
    "Cards with icons and links, plus an optional list of items (e.g. case types, categories)",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Main heading for this section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Section Eyebrow",
      type: "string",
      description: "Small label above the main heading (e.g. Our Services)",
    }),
    defineField({
      name: "highlightedText",
      title: "Highlighted Text",
      type: "string",
      description:
        "Optional part of the title to highlight. Must appear in the section title above.",
    }),
    defineField({
      name: "description",
      title: "Section Description",
      type: "text",
      rows: 3,
      description: "Supporting copy displayed alongside the section heading.",
    }),
    defineField({
      name: "serviceCards",
      title: "Service Cards",
      type: "array",
      description: "Cards for each service or category",
      of: [serviceCard],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "caseTypesHeading",
      title: "List Heading",
      type: "string",
      description:
        "Heading above the optional list (e.g. Over 50 Case Types, Like:)",
    }),
    defineField({
      name: "viewAllText",
      title: "View All Link Text",
      type: "string",
      description: "Text for the link to view all items",
      initialValue: () => "View all",
    }),
    defineField({
      name: "viewAllUrl",
      title: "View All Link URL",
      type: "customUrl",
      description: "Where the View all link goes",
    }),
    defineField({
      name: "caseTypes",
      title: "List Items",
      type: "array",
      description: "Optional list of items (each can be a link)",
      of: [
        defineField({
          name: "caseTypeLink",
          type: "object",
          title: "Item",
          fields: [
            defineField({
              name: "title",
              title: "Label",
              type: "string",
              description:
                "Text to display (e.g. Social Security, Medical Malpractice)",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "Link URL",
              type: "customUrl",
              description: "Where this item links to (optional)",
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({ title: title ?? "Untitled" }),
          },
        }),
      ],
    }),
    defineField({
      name: "bottomCtaEyebrow",
      title: "Bottom CTA Eyebrow",
      type: "string",
      description: "Small label above the bottom CTA heading.",
    }),
    defineField({
      name: "bottomCtaTitle",
      title: "Bottom CTA Title",
      type: "string",
      description: "Main text for the bottom CTA panel.",
    }),
    defineField({
      name: "bottomCtaButtonText",
      title: "Bottom CTA Button Text",
      type: "string",
      description: "Label for the bottom CTA button.",
      initialValue: () => "Request Free Quote",
    }),
    defineField({
      name: "bottomCtaButtonUrl",
      title: "Bottom CTA Button URL",
      type: "customUrl",
      description: "Where the bottom CTA button goes.",
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
      cards: "serviceCards",
      types: "caseTypes",
    },
    prepare: ({ title, cards = [], types = [] }) => ({
      title: title ?? "Service Cards",
      subtitle: `${cards.length} card${cards.length === 1 ? "" : "s"}, ${types.length} item${types.length === 1 ? "" : "s"}`,
      media: Layers,
    }),
  },
});
