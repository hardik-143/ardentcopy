import { LayoutList } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { anchorIdField, imageWithAltField } from "@studio/schemaTypes/common";
import { createRadioListLayout } from "@studio/utils/helper";
import { createCustomBlock } from "@studio/utils/customBlock";

export const contentList = defineType({
  name: "contentList",
  title: "Content List",
  type: "object",
  icon: LayoutList,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label displayed above the section heading",
    }),
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Optional heading for the whole section",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      description: "Optional rich text description for the whole section (supports bold and links)",
      of: [createCustomBlock({ only: true, normal: true, bold: true, link: true })],
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      description: "Add content items — each with an image, heading, description, and buttons",
      of: [
        defineArrayMember({
          name: "item",
          title: "Item",
          type: "object",
          fields: [
            imageWithAltField({
              name: "image",
              title: "Image",
              description: "Image for this item",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "imagePosition",
              title: "Image Position",
              type: "string",
              description: "Place the image on the left or right side of the content",
              initialValue: () => "left",
              options: createRadioListLayout(
                [
                  { title: "Left", value: "left" },
                  { title: "Right", value: "right" },
                ],
                { direction: "horizontal" }
              ),
            }),
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              description: "Item heading",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "array",
              description: "Supporting text below the heading (supports bold and links)",
              of: [createCustomBlock({ only: true, normal: true, bold: true, link: true })],
            }),
            defineField({
              name: "buttons",
              title: "Buttons",
              type: "array",
              of: [{ type: "button" }],
            }),
          ],
          preview: {
            select: {
              title: "heading",
              media: "image",
              imagePosition: "imagePosition",
            },
            prepare: ({ title, media, imagePosition }) => ({
              title: title || "Untitled Item",
              subtitle: `Image ${imagePosition ?? "left"}`,
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      item0: "items.0.heading",
    },
    prepare: ({ title, item0 }) => ({
      title: title || item0 || "Content List",
      subtitle: "Content List",
      media: LayoutList,
    }),
  },
});
