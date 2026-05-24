import { ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const imageBlock = defineType({
  name: "imageBlock",
  title: "Image",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          name: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alt Text",
              description: "Describe the image for accessibility and SEO",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { media: "asset", title: "alt" },
            prepare({ media, title }) {
              return { media, title: title || "Image" };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).max(5).required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
          { title: "Full Width", value: "full" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
      hidden: ({ parent }) => (parent?.images?.length ?? 0) > 1,
    }),
  ],
  preview: {
    select: {
      media: "images.0.asset",
      caption: "caption",
      size: "size",
      images: "images",
    },
    prepare({ media, caption, size, images }) {
      const count = Array.isArray(images) ? images.length : 0;
      return {
        title: caption || "Image Block",
        subtitle: count === 1 ? `1 image · ${size ?? "medium"}` : `${count} images`,
        media,
      };
    },
  },
});
