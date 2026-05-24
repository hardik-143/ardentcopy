import { ColumnsIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";
import { customRichText } from "@studio/schemaTypes/definitions/rich-text";

export const splitContent = defineType({
  name: "splitContent",
  title: "Split Content",
  type: "object",
  icon: ColumnsIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Optional heading displayed above the content",
    }),
    customRichText(["block"], {
      name: "content",
      title: "Content",
      description:
        "Rich text content (headings, lists, links). Media is in the adjacent column.",
    }),
    defineField({
      name: "mediaPosition",
      title: "Media position",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "right",
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "array",
      description: "Image or video for the media column. Add one item.",
      validation: (rule) => rule.required().min(1).max(1).error("Media is required. Add one image or video."),
      of: [
        defineArrayMember({
          name: "image",
          title: "Image",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "caption",
              type: "string",
              title: "Caption",
            }),
          ],
        }),
        defineArrayMember({
          name: "video",
          title: "Video",
          type: "file",
          options: { accept: "video/*" },
        }),
      ],
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
      mediaPosition: "mediaPosition",
    },
    prepare: ({ title, mediaPosition }) => ({
      title: title || "Split Content",
      subtitle: `Media ${mediaPosition === "left" ? "left" : "right"}`,
      media: ColumnsIcon,
    }),
  },
});
