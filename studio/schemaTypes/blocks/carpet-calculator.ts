import { CalculatorIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField } from "@studio/schemaTypes/common";

export const carpetCalculator = defineType({
  name: "carpetCalculator",
  title: "Carpet Cleaning Calculator",
  type: "object",
  icon: CalculatorIcon,
  description:
    "Embeds a Commercial or Residential carpet cleaning quote calculator. Pick the calculator document to use.",
  fields: [
    defineField({
      name: "calculatorType",
      title: "Calculator Type",
      type: "string",
      options: {
        list: [
          { title: "Commercial", value: "commercial" },
          { title: "Residential", value: "residential" },
        ],
        layout: "radio",
      },
      initialValue: "commercial",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "commercialCalculator",
      title: "Commercial Calculator",
      type: "reference",
      to: [{ type: "commercialCalculator" }],
      hidden: ({ parent }) => parent?.calculatorType !== "commercial",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const parent = ctx.parent as { calculatorType?: string } | undefined;
          if (parent?.calculatorType === "commercial" && !value) {
            return "Pick a Commercial Calculator document";
          }
          return true;
        }),
    }),
    defineField({
      name: "residentialCalculator",
      title: "Residential Calculator",
      type: "reference",
      to: [{ type: "residentialCalculator" }],
      hidden: ({ parent }) => parent?.calculatorType !== "residential",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const parent = ctx.parent as { calculatorType?: string } | undefined;
          if (parent?.calculatorType === "residential" && !value) {
            return "Pick a Residential Calculator document";
          }
          return true;
        }),
    }),
    defineField({
      name: "title",
      title: "Section Title (optional override)",
      type: "string",
      description:
        "Leave empty to use the title set on the referenced calculator document.",
    }),
    anchorIdField,
  ],
  preview: {
    select: {
      type: "calculatorType",
      title: "title",
      commercialName: "commercialCalculator.internalName",
      residentialName: "residentialCalculator.internalName",
    },
    prepare: ({ type, title, commercialName, residentialName }) => {
      const refName = type === "residential" ? residentialName : commercialName;
      const subtitle =
        type === "residential" ? "Residential Calculator" : "Commercial Calculator";
      return {
        title: title ?? refName ?? subtitle,
        subtitle: refName ? subtitle : `${subtitle} (no document selected)`,
        media: CalculatorIcon,
      };
    },
  },
});
