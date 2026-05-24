"use client";

import { ProjectsPageContent } from "@/components/projects-page-content";
import type { PagebuilderType } from "@/types";

type SingleLocationProjectsProps = PagebuilderType<"singleLocationProjects">;

export function SingleLocationProjectsBlock({
  badge,
  title,
  subtitle,
  project_types,
  city_states,
  materials_used,
}: SingleLocationProjectsProps) {
  return (
    <ProjectsPageContent
      badge={badge}
      title={title}
      subtitle={subtitle}
      showFilters={false}
      initialFilters={{ project_types, city_states, materials_used }}
    />
  );
}
