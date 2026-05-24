import { Film } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";

export const media = defineType({
  name: "media",
  title: "Media",
  type: "object",
  icon: Film,
  fields: [
    defineField({
      name: "mediaType",
      type: "string",
      title: "Type",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== "image",
      fields: [
        defineField({
          name: "caption",
          type: "string",
          title: "Caption",
        }),
      ],
    }),
    defineField({
      name: "video",
      type: "file",
      title: "Video",
      options: {
        accept: "video/*",
      },
      hidden: ({ parent }) => parent?.mediaType !== "video",
      fields: [
        defineField({
          name: "caption",
          type: "string",
          title: "Caption",
        }),
      ],
    }),
    anchorIdField,
  ],
  preview: {
    select: { mediaType: "mediaType" },
    prepare({ mediaType }) {
      return {
        title: "Media",
        subtitle: mediaType === "image" ? "Image" : "Video",
        media: Film,
      };
    },
  },
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value?.mediaType) return "Select image or video";
      if (value.mediaType === "image" && !value.image) return "Select an image";
      if (value.mediaType === "video" && !value.video) return "Select a video";
      return true;
    }),
});
