import { MapPin } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { ProjectFilterSelectInput } from "@studio/components/project-filter-select-input";
import { SingleLocationProjectsPreview } from "@studio/components/single-location-projects-preview";

function createFilterField({
  name,
  title,
  description,
}: {
  name: "city_states" | "materials_used" | "project_types";
  title: string;
  description: string;
}) {
  return defineField({
    name,
    title,
    type: "array",
    description,
    of: [defineArrayMember({ type: "string" })],
    components: {
      input: ProjectFilterSelectInput,
    },
  });
}

export const singleLocationProjects = defineType({
  name: "singleLocationProjects",
  title: "Single Location Projects",
  icon: MapPin,
  type: "object",
  components: {
    preview: SingleLocationProjectsPreview,
  },
  fields: [
    defineField({
      name: "badge",
      type: "string",
      title: "Badge / Tag",
      description: "Optional label above the headline (e.g. 'Our Work')",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Heading",
      description: "Main heading for the section",
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
      description: "Supporting text below the heading",
    }),
    
    createFilterField({
      name: "city_states",
      title: "City & State Filters",
      description:
        "Projects must match these City & State filter values from CompanyCam.",
    }),
    createFilterField({
      name: "project_types",
      title: "Project Type Filters",
      description:
        "Projects must match these Project Type filter values from CompanyCam.",
    }),
    
    createFilterField({
      name: "materials_used",
      title: "Products Used Filters",
      description:
        "Projects must match these Products Used filter values from CompanyCam.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      city_states: "city_states",
      project_types: "project_types",
      materials_used: "materials_used",
    },
  },
});
