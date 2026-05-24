import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { BookAIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const glossary = defineType({
  name: "glossary",
  title: "Glossary Term",
  type: "document",
  icon: BookAIcon,
  orderings: [orderRankOrdering],
  description:
    "A glossary term with its definition, example usage, and related terms for the legal dictionary.",
  fields: [
    orderRankField({ type: "glossary" }),
    defineField({
      name: "term",
      type: "string",
      title: "Term",
      description: "The word or phrase being defined",
      validation: (Rule) => Rule.required().error("A term is required"),
    }),
    defineField({
      name: "termSlug",
      type: "slug",
      title: "Term Slug",
      description:
        "URL-friendly version of the term (used in ?term=slug query parameter)",
      options: {
        source: "term",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A term slug is required"),
    }),
    defineField({
      name: "definition",
      type: "text",
      title: "Definition",
      rows: 4,
      description: "A clear and concise explanation of the term",
      validation: (Rule) => Rule.required().error("A definition is required"),
    }),
    defineField({
      name: "example",
      type: "text",
      title: "Example",
      rows: 3,
      description:
        "An example sentence showing how the term is used in context",
    }),
    defineField({
      name: "whyItMatters",
      type: "text",
      title: "Why This Matters",
      rows: 4,
      description:
        "Explain why this term is important in personal injury cases or legal context",
    }),
    defineField({
      name: "relatedTerms",
      type: "array",
      title: "Related Terms",
      description: "Other glossary terms that are related to this one",
      of: [
        defineArrayMember({
          type: "reference",
          to: [
            {
              type: "glossary",
              options: {
                disableNew: true,
              },
            },
          ],
          options: {
            disableNew: true,
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: "term",
      termSlug: "termSlug.current",
    },
    prepare: ({ title, termSlug }) => ({
      title: title || "Untitled Term",
      subtitle: termSlug || "no-slug",
    }),
  },
});
