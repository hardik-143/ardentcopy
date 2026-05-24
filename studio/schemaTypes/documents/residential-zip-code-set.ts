import { HomeIcon, MapPinIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const serviceZipCode = defineArrayMember({
  name: "serviceZipCode",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "Friendly label, e.g. 'Auburn'",
    }),
    defineField({
      name: "zipStart",
      title: "Zip Range Start",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(0).max(99999),
    }),
    defineField({
      name: "zipEnd",
      title: "Zip Range End",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(0).max(99999),
    }),
    defineField({
      name: "minimumCharge",
      title: "Minimum Charge ($)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      label: "label",
      a: "zipStart",
      b: "zipEnd",
      min: "minimumCharge",
      active: "isActive",
    },
    prepare: ({ label, a, b, min, active }) => {
      const range = a === b ? `${a}` : `${a}–${b}`;
      return {
        title: `${range}${label ? ` · ${label}` : ""}`,
        subtitle: `min $${min}${active ? "" : " (inactive)"}`,
      };
    },
  },
});

export const residentialZipCodeSet = defineType({
  name: "residentialZipCodeSet",
  title: "Residential Zip Code Set",
  type: "document",
  icon: MapPinIcon,
  description:
    "Reusable residential service-area zip ranges. Reference one from any Residential Calculator that should share the same service area and minimum charges.",
  fields: [
    defineField({
      name: "internalName",
      title: "Internal Name",
      type: "string",
      description:
        "Used to identify this zip-code set inside the studio. Not shown to visitors.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "zipCodes",
      title: "Service Zip Codes",
      type: "array",
      of: [serviceZipCode],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "internalName", count: "zipCodes" },
    prepare: ({ title, count }) => ({
      title: title ?? "Untitled Residential Zip Code Set",
      subtitle: `${Array.isArray(count) ? count.length : 0} zip range(s)`,
      media: HomeIcon,
    }),
  },
});
