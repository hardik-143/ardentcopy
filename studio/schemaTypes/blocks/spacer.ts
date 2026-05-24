import { SpaceIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";

export const spacer = defineType({
  name: "spacer",
  title: "Spacer",
  type: "object",
  icon: SpaceIcon,
  fields: [
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      description: "Controls the vertical spacing",
      initialValue: "medium",
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
          { title: "Extra Large", value: "xlarge" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showDivider",
      title: "Show Divider Line",
      type: "boolean",
      description: "Display a horizontal divider line in the spacer",
      initialValue: false,
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      size: "size",
      showDivider: "showDivider",
    },
    prepare: ({ size, showDivider }) => {
      const sizeLabel = size ? size.charAt(0).toUpperCase() + size.slice(1) : "Medium";
      const dividerLabel = showDivider ? " + Divider" : "";
      return {
        title: `Spacer (${sizeLabel}${dividerLabel})`,
        subtitle: "Spacer",
        media: SpaceIcon,
      };
    },
  },
});
