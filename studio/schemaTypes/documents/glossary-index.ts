import { BookAIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { documentSlugField, pageBuilderField } from "@studio/schemaTypes/common";
import { GROUP, GROUPS } from "@studio/utils/constant";
import { sanitySeoField } from "@studio/utils/seo-fields";

export const glossaryIndex = defineType({
  name: "glossaryIndex",
  type: "document",
  title: "Glossary Page",
  icon: BookAIcon,
  description:
    "The main glossary page that displays all legal terms. Clicking on a term will open a modal with the full definition.",
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The main heading for the glossary page",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
      description:
        "A short introduction explaining what the glossary contains",
      group: GROUP.MAIN_CONTENT,
    }),
    documentSlugField("glossaryIndex", {
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
      title: title || "Glossary",
      subtitle: description || slug || "Glossary Index",
    }),
  },
});
