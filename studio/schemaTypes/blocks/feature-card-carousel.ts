import { GalleryHorizontal } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";
import { customRichText } from "@studio/schemaTypes/definitions/rich-text";

const featureCardCarouselCard = defineField({
  name: "featureCardCarouselCard",
  type: "object",
  fields: [
    defineField({
      name: "amount",
      type: "string",
      description: "Monetary amount or recovery value (e.g. $75,000.00)",
    }),
    customRichText(["block"], {
      name: "description",
      title: "Description",
      description: "Case details or short description",
    }),
    defineField({
      name: "firmName",
      type: "string",
      description: "Legal firm or entity name (e.g. Gillani Law)",
    }),
    defineField({
      name: "isMajorWin",
      type: "boolean",
      description: "Show MAJOR WIN tag and highlighted border",
      initialValue: false,
    }),
    defineField({
      name: "caseWon",
      type: "boolean",
      description: "Show Case Won badge",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      amount: "amount",
      firmName: "firmName",
    },
    prepare: ({ amount, firmName }) => ({
      title: amount ?? "No amount",
      subtitle: firmName ?? undefined,
    }),
  },
});

export const featureCardCarousel = defineType({
  name: "featureCardCarousel",
  type: "object",
  icon: GalleryHorizontal,
  description:
    "A carousel of victory/case cards with amounts, descriptions, and optional summary",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional text that appears above the main title",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The main heading for this section (e.g. Recent Victories)",
    }),
    customRichText(["block"], {
      name: "description",
      title: "Description",
      description: "Introductory paragraph below the title",
    }),
    defineField({
      name: "cards",
      type: "array",
      description: "The individual cards to display in the carousel",
      of: [featureCardCarouselCard],
    }),
    defineField({
      name: "overallSummary",
      type: "string",
      description: "Summary text below the carousel (e.g. Over $2.3M in Recent Recoveries)",
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title,
      subtitle: "Feature Card Carousel",
      media: GalleryHorizontal,
    }),
  },
});
