import { Building2Icon, CalculatorIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const addonOption = defineArrayMember({
  name: "commercialAddonOption",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "rateAddition",
      title: "Rate Addition ($/sq ft)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "title", rate: "rateAddition", active: "isActive" },
    prepare: ({ title, rate, active }) => ({
      title,
      subtitle: `+$${rate ?? 0}/sq ft${active ? "" : " (inactive)"}`,
    }),
  },
});

const furnishingOption = defineArrayMember({
  name: "commercialFurnishingOption",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "multiplier",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "isDefault",
      title: "Default Selection",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", mult: "multiplier", def: "isDefault" },
    prepare: ({ title, mult, def }) => ({
      title,
      subtitle: `× ${mult}${def ? " (default)" : ""}`,
    }),
  },
});

const buildingType = defineArrayMember({
  name: "commercialBuildingType",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "isActive", title: "Active", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "label", active: "isActive" },
    prepare: ({ title, active }) => ({
      title,
      subtitle: active ? "Active" : "Inactive",
    }),
  },
});

export const commercialCalculator = defineType({
  name: "commercialCalculator",
  title: "Commercial Calculator",
  type: "document",
  icon: CalculatorIcon,
  description:
    "A complete configuration for a Commercial Carpet Cleaning quote calculator. Create as many as you need (e.g. one per region or service tier) and reference one in a Calculator pagebuilder block.",
  fields: [
    defineField({
      name: "internalName",
      title: "Internal Name",
      type: "string",
      description:
        "Used to identify this calculator inside the studio. Not shown to visitors.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Public Title",
      type: "string",
      initialValue: "Commercial Carpet Cleaning Quote Calculater",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "introText",
      title: "Intro Text",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "quoteNote",
      title: "Quote Note",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "baseRate",
          title: "Base Rate ($/sq ft)",
          type: "number",
          initialValue: 0.32,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "minDay",
          title: "Daytime Minimum Charge ($)",
          type: "number",
          initialValue: 300,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "minAH1",
          title: "After-Hours 6–10pm Minimum Charge ($)",
          type: "number",
          initialValue: 450,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "minAH2",
          title: "After-Hours 10pm+ Minimum Charge ($)",
          type: "number",
          initialValue: 600,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "floorAH1",
          title: "After-Hours 6–10pm Rate Floor ($/sq ft)",
          type: "number",
          initialValue: 0.48,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "floorAH2",
          title: "After-Hours 10pm+ Rate Floor ($/sq ft)",
          type: "number",
          initialValue: 0.64,
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "rangeVariance",
          title: "Quote Range Variance (e.g. 0.2 = ±20%)",
          type: "number",
          initialValue: 0.2,
          validation: (Rule) => Rule.required().min(0).max(1),
        }),
      ],
    }),
    defineField({
      name: "addons",
      title: "Add-on Options",
      type: "array",
      of: [addonOption],
    }),
    defineField({
      name: "furnishings",
      title: "Furnishing Options",
      type: "array",
      of: [furnishingOption],
      validation: (Rule) =>
        Rule.custom((items: unknown) => {
          if (!Array.isArray(items)) return true;
          const defaults = items.filter(
            (i: { isDefault?: boolean }) => i?.isDefault
          );
          if (defaults.length > 1) return "Only one furnishing option can be marked default.";
          return true;
        }),
    }),
    defineField({
      name: "buildingTypes",
      title: "Building Types",
      type: "array",
      of: [buildingType],
    }),
  ],
  preview: {
    select: { title: "internalName", subtitle: "title" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Untitled Commercial Calculator",
      subtitle,
      media: Building2Icon,
    }),
  },
});
