import { lucideIconPreview } from "@studio/components/icon-preview";
import { anchorIdField, iconField } from "@studio/schemaTypes/common";
import { MapPinned } from "lucide-react";
import { defineField, defineType } from "sanity";

const serviceAreaItem = defineField({
  name: "serviceAreaItem",
  title: "Area",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Area Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "Area Link",
      type: "customUrl",
      description:
        "Optional link for this area. Use an internal page when a matching local service page exists.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      urlType: "url.type",
    },
    prepare: ({ title, urlType }) => ({
      title: title ?? "Area",
      subtitle: urlType === "internal" ? "Linked to internal page" : undefined,
    }),
  },
});

const serviceAreaGroup = defineField({
  name: "serviceAreaGroup",
  title: "County Group",
  type: "object",
  fields: [
    iconField,
    defineField({
      name: "title",
      title: "County Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "areas",
      title: "Areas",
      type: "array",
      of: [serviceAreaItem],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
      areas: "areas",
    },
    prepare: ({ areas = [], icon, title }) => ({
      title: title ?? "County Group",
      subtitle: `${areas.length} area${areas.length === 1 ? "" : "s"}`,
      media: lucideIconPreview(icon) ?? MapPinned,
    }),
  },
});

export const serviceAreas = defineType({
  name: "serviceAreas",
  title: "Service Areas",
  icon: MapPinned,
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Section Eyebrow",
      type: "string",
      description: "Small label above the main heading.",
    }),
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "highlightedText",
      title: "Highlighted Text",
      type: "string",
      description:
        "Optional part of the title to render in the accent color. Must appear in the title above.",
    }),
    defineField({
      name: "description",
      title: "Section Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "groups",
      title: "County Groups",
      type: "array",
      description: "County blocks shown in the service-area grid.",
      of: [serviceAreaGroup],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: "ctaEyebrow",
      title: "CTA Eyebrow",
      type: "string",
      description: "Small label shown at the top of the orange CTA tile.",
    }),
    defineField({
      name: "ctaTitle",
      title: "CTA Title",
      type: "string",
      description: "Main heading in the orange CTA tile.",
    }),
    defineField({
      name: "ctaDescription",
      title: "CTA Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "ctaButtonText",
      title: "CTA Button Text",
      type: "string",
      initialValue: () => "Ask About Your Area",
    }),
    defineField({
      name: "ctaButtonUrl",
      title: "CTA Button URL",
      type: "customUrl",
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
      groups: "groups",
    },
    prepare: ({ groups = [], title }) => ({
      title: title ?? "Service Areas",
      subtitle: `${groups.length} group${groups.length === 1 ? "" : "s"}`,
      media: MapPinned,
    }),
  },
});
