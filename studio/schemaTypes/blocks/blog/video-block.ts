import { VideoIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const videoBlock = defineType({
  name: "videoBlock",
  title: "Video",
  type: "object",
  icon: VideoIcon,
  fields: [
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Vimeo", value: "vimeo" },
          { title: "Upload File", value: "file" },
        ],
        layout: "radio",
      },
      initialValue: "youtube",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "Video URL",
      type: "url",
      description: "Paste a YouTube or Vimeo URL",
      hidden: ({ parent }) => parent?.source === "file",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"] }).custom((url, context) => {
          const parent = context.parent as { source?: string } | undefined;
          if (parent?.source !== "file" && !url) return "Video URL is required";
          return true;
        }),
    }),
    defineField({
      name: "file",
      title: "Video File",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => parent?.source !== "file",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  preview: {
    select: {
      source: "source",
      url: "url",
      caption: "caption",
    },
    prepare({ source, url, caption }) {
      const sourceLabel = source === "youtube" ? "YouTube" : source === "vimeo" ? "Vimeo" : "File";
      return {
        title: caption || url || "Video",
        subtitle: sourceLabel,
      };
    },
  },
});
