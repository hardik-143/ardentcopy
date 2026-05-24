import { MedalIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";

export const awardsAndReviews = defineType({
  name: "awardsAndReviews",
  title: "Awards & Reviews",
  type: "object",
  icon: MedalIcon,
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      initialValue: "Awards and Reviews",
      description: "Heading displayed at the top of the section",
    }),
    defineField({
      name: "awardsTitle",
      title: "Awards Column Title",
      type: "string",
      initialValue: "Notable Awards Received",
    }),
    defineField({
      name: "awardImages",
      title: "Award Images",
      type: "array",
      description: "Upload award badge images — displayed side by side",
      of: [
        defineArrayMember({
          name: "awardImage",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alt Text",
              description: "Describe this award for screen readers",
            }),
          ],
          preview: {
            select: { media: "asset", alt: "alt" },
            prepare: ({ alt }) => ({ title: alt || "Award Image" }),
          },
        }),
      ],
    }),
    defineField({
      name: "button",
      title: "CTA Button",
      type: "button",
      description: "Button shown below the award images — use Section type to link to the pricing block on this page",
    }),
    // TODO: reviews column — uncomment when embed widget is ready
    // defineField({
    //   name: "reviewsTitle",
    //   title: "Reviews Column Title",
    //   type: "string",
    //   initialValue: "What People Are Saying",
    // }),
    // defineField({
    //   name: "reviewsEmbedCode",
    //   title: "Reviews Embed Code",
    //   type: "text",
    //   description: "Paste your Google Reviews, Birdeye, or other review widget HTML/iframe code here",
    //   rows: 6,
    // }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
      awardCount: "awardImages",
    },
    prepare: ({ title, awardCount }) => ({
      title: title || "Awards & Reviews",
      subtitle: `${Array.isArray(awardCount) ? awardCount.length : 0} award image(s)`,
      media: MedalIcon,
    }),
  },
});
