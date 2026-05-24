import { HelpCircle } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { lucideIconPreview } from "@studio/components/icon-preview";
import { anchorIdField, buttonsField, iconField, imageWithAltField } from "@studio/schemaTypes/common";

const highlightMember = defineArrayMember({
  name: "highlightItem",
  type: "object",
  fields: [
    iconField,
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Main label for this highlight",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", icon: "icon" },
    prepare({ title, icon }) {
      return {
        title: title ?? "Untitled highlight",
        subtitle: "Highlight",
        media: lucideIconPreview(icon),
      };
    },
  },
});

export const faqWithCta = defineType({
  name: "faqWithCta",
  title: "FAQ with CTA",
  type: "object",
  icon: HelpCircle,
  description:
    "Two-column section: FAQ accordion on the left (7:5 desktop, 5:3 tablet), highlights and CTA button on the right",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Main heading above the section",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      description: "Select the FAQ items to display in the accordion",
      of: [
        {
          type: "reference",
          to: [{ type: "faq" }],
          options: { disableNew: true },
        },
      ],
      validation: (Rule) => [Rule.required(), Rule.unique()],
    }),
    defineField({
      name: "ctaCardTitle",
      title: "CTA card title",
      type: "string",
      description: "Main heading at the top of the CTA card (e.g. Free case review)",
    }),
    defineField({
      name: "ctaCardSubtitle",
      title: "CTA card subtitle",
      type: "string",
      description: "Supporting text below the card title (e.g. You pay nothing unless we recover)",
    }),
    imageWithAltField({
      name: "ctaCardIcon",
      title: "CTA card icon",
      description:
        "Upload an icon or image to show next to the card title (e.g. for “Free case review”)",
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      description: "List of highlight items (icon and title) shown in the right column",
      of: [highlightMember],
    }),
    buttonsField,
    anchorIdField,
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return {
        title: title ?? "FAQ with CTA",
        subtitle: "FAQ with CTA",
        media: HelpCircle,
      };
    },
  },
});
