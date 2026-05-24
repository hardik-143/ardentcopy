import { CalculatorIcon, HomeIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const numField = (name: string, title: string, initialValue: number) =>
  defineField({
    name,
    title,
    type: "number",
    initialValue,
    validation: (Rule) => Rule.required().min(0),
  });

const furnitureTier = defineArrayMember({
  name: "furnitureTier",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rateAvg",
      title: "Rate / Room (Avg)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "rateLow",
      title: "Rate / Room (Low)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "rateHigh",
      title: "Rate / Room (High)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "isNone",
      title: "Is 'None' option",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", avg: "rateAvg", none: "isNone" },
    prepare: ({ title, avg, none }) => ({
      title,
      subtitle: none ? "No furniture" : `$${avg}/room`,
    }),
  },
});

const treatmentAddon = defineArrayMember({
  name: "treatmentAddon",
  type: "object",
  fields: [
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description:
        "Stable identifier used by the calculator engine. The 'heavy' key triggers bundled discounts on other treatments that have a Bundled Multiplier.",
      options: {
        list: [
          { title: "Heavy / Deep Cleaning", value: "heavy" },
          { title: "Pet Urine Treatment", value: "urine" },
          { title: "Pet Dander Removal", value: "dander" },
          { title: "Apply Protectant", value: "protect" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "multiplier",
      title: "Multiplier (× cleaning subtotal)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "bundledMultiplier",
      title: "Bundled Multiplier (when Heavy is also selected)",
      type: "number",
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "label", mult: "multiplier", active: "isActive" },
    prepare: ({ title, mult, active }) => ({
      title,
      subtitle: `× ${mult}${active ? "" : " (inactive)"}`,
    }),
  },
});

const oilSpotBracket = defineArrayMember({
  name: "oilSpotBracket",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "Shown in the dropdown, e.g. '6–10 small or 2 large'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "flatPrice",
      title: "Flat Price ($)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
  preview: {
    select: { title: "label", price: "flatPrice" },
    prepare: ({ title, price }) => ({ title, subtitle: `$${price}` }),
  },
});

export const residentialCalculator = defineType({
  name: "residentialCalculator",
  title: "Residential Calculator",
  type: "document",
  icon: CalculatorIcon,
  description:
    "A complete configuration for a Residential Carpet Cleaning quote calculator. Create as many as you need (e.g. one per service area) and reference one in a Calculator pagebuilder block.",
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
      initialValue: "Calculator for Residential Carpet Cleaning",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "disclaimerText",
      title: "Disclaimer Text",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "quoteResultsNote",
      title: "Quote Results Note",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cleaningRates",
      title: "Cleaning Rates",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        numField("perRoomAvg", "Per Room (Avg)", 84),
        numField("perRoomLow", "Per Room (Low)", 52.5),
        numField("perRoomHigh", "Per Room (High)", 122.5),
        numField("perSmallHallAvg", "Per Small Hallway ≤100 sf (Avg)", 48),
        numField("perSmallHallLow", "Per Small Hallway (Low)", 40),
        numField("perSmallHallHigh", "Per Small Hallway (High)", 56),
        numField("perLargeHallAvg", "Per Large Hallway 100–200 sf (Avg)", 96),
        numField("perLargeHallLow", "Per Large Hallway (Low)", 80),
        numField("perLargeHallHigh", "Per Large Hallway (High)", 112),
        numField("perStepAvg", "Per Stair Step (Avg)", 7),
        numField("perStepLow", "Per Stair Step (Low)", 6.3),
        numField("perStepHigh", "Per Stair Step (High)", 7.35),
      ],
    }),
    defineField({
      name: "areaAverages",
      title: "Area Averages (sq ft)",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        numField("roomTotalSqFt", "Per Room (Total Area)", 200),
        numField("roomTrafficSqFt", "Per Room (Traffic Area)", 175),
        numField("smallHallSqFt", "Per Small Hallway", 100),
        numField("largeHallSqFt", "Per Large Hallway", 200),
      ],
    }),
    defineField({
      name: "pricePerColorStain",
      title: "Price Per Color Stain ($)",
      type: "number",
      initialValue: 25,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "zipCodeConfig",
      title: "Service Zip Code Set",
      type: "reference",
      to: [{ type: "residentialZipCodeSet" }],
      description:
        "Pick the reusable zip-code configuration this calculator should use.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "furnitureTiers",
      title: "Furniture Tiers",
      type: "array",
      of: [furnitureTier],
    }),
    defineField({
      name: "treatmentAddons",
      title: "Treatment Add-ons",
      type: "array",
      of: [treatmentAddon],
    }),
    defineField({
      name: "oilSpotBrackets",
      title: "Oil/Grease Spot Brackets",
      type: "array",
      of: [oilSpotBracket],
    }),
  ],
  preview: {
    select: { title: "internalName", subtitle: "title" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Untitled Residential Calculator",
      subtitle,
      media: HomeIcon,
    }),
  },
});
