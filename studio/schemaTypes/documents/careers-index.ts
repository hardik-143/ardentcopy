import { BriefcaseIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { documentSlugField, pageBuilderField } from "@studio/schemaTypes/common";
import { GROUP, GROUPS } from "@studio/utils/constant";
import { sanitySeoField } from "@studio/utils/seo-fields";

export const careersIndex = defineType({
  name: "careersIndex",
  type: "document",
  title: "Careers Page",
  icon: BriefcaseIcon,
  description:
    "The main careers page that lists all job openings. Customize the title, description, and add page builder sections.",
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The main heading for the careers page",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
      description:
        "A short introduction explaining your open positions and how to apply",
      group: GROUP.MAIN_CONTENT,
    }),
    documentSlugField("careersIndex", {
      group: GROUP.MAIN_CONTENT,
    }),
    pageBuilderField,
    sanitySeoField,
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      slug: "slug.current",
    },
    prepare: ({ title, description, slug }) => ({
      title: title || "Careers",
      subtitle: description || slug || "Careers Index",
    }),
  },
});
