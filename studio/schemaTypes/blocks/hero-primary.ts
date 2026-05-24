import { lucideIconPreview } from "@studio/components/icon-preview";
import {
  anchorIdField,
  buttonsField,
  iconField,
  imageWithAltField,
} from "@studio/schemaTypes/common";
import { Star } from "lucide-react";
import { defineField, defineType } from "sanity";

const heroTrustItem = defineField({
  name: "heroTrustItem",
  title: "Trust Item",
  type: "object",
  fields: [
    iconField,
    defineField({
      name: "displayStyle",
      type: "string",
      title: "Display Style",
      description:
        "Choose whether this trust item shows a single icon or a 5-star row.",
      initialValue: () => "icon",
      options: {
        list: [
          { title: "Single Icon", value: "icon" },
          { title: "Five Stars", value: "stars" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "value",
      type: "string",
      title: "Value",
      description: "Primary metric value, like 5.0 or 22+",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      type: "string",
      title: "Label",
      description: "Short supporting label, like Google Rating",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "value",
      subtitle: "label",
      icon: "icon",
    },
    prepare: ({ icon, subtitle, title }) => ({
      title: title ?? "Trust Item",
      subtitle,
      media: lucideIconPreview(icon) ?? Star,
    }),
  },
});

export const heroPrimary = defineType({
  name: "heroPrimary",
  title: "Hero Primary",
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "highlightedText",
      type: "string",
      title: "Highlighted Text",
      description:
        "Optional part of the headline to render in the accent color. Must appear in the headline above.",
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
      description: "Optional supporting text below the headline",
    }),
    defineField({
      name: "trustItems",
      title: "Trust Items",
      type: "array",
      description:
        "Metrics shown below the buttons, like rating or years of experience.",
      of: [heroTrustItem],
      initialValue: () => [
        {
          _type: "heroTrustItem",
          icon: "star",
          displayStyle: "stars",
          value: "5.0",
          label: "Google Rating",
        },
        {
          _type: "heroTrustItem",
          icon: "badge-check",
          displayStyle: "icon",
          value: "22+",
          label: "Years Experience",
        },
        {
          _type: "heroTrustItem",
          icon: "shield-check",
          displayStyle: "icon",
          value: "A+",
          label: "BBB Accredited",
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "certificationTitle",
      type: "string",
      title: "Certification Title",
      description: "Main title for the floating certification card.",
    }),
    defineField({
      name: "certificationSubtitle",
      type: "string",
      title: "Certification Subtitle",
      description: "Small supporting text for the floating certification card.",
    }),
    imageWithAltField({
      name: "backgroundImage",
      title: "Background Image",
      description:
        "Optional full-section background image shown behind the patterned overlay.",
    }),
    imageWithAltField({
      name: "image",
      title: "Hero Image",
      description: "Main image shown on the right side of the hero section",
    }),
    buttonsField,
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Hero Primary",
      subtitle: "Hero Primary Block",
      media: Star,
    }),
  },
});
