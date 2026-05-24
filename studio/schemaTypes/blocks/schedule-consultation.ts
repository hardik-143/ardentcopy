import { CalendarCheckIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { anchorIdField, buttonsField } from "@studio/schemaTypes/common";

export const scheduleConsultation = defineType({
  name: "scheduleConsultation",
  title: "Schedule Consultation",
  type: "object",
  icon: CalendarCheckIcon,
  description:
    "A two-column section: contact info on the left, and a call-to-action card on the right for scheduling a free consultation.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Main heading on the left (e.g. Schedule A Free Consultation)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description:
        "Short paragraph below the title describing your firm or offer",
      rows: 3,
    }),
    buttonsField,
    anchorIdField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Schedule Consultation",
      subtitle: "Contact + CTA card",
      media: CalendarCheckIcon,
    }),
  },
});
