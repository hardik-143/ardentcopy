"use client";

import type { PagebuilderType } from "@/types";
import { ProjectsPageContent } from "@/components/projects-page-content";

type ProjectListingProps = PagebuilderType<"projectListing">;

export function ProjectListingBlock({ badge, title, subtitle }: ProjectListingProps) {
  return (
    <ProjectsPageContent badge={badge} title={title} subtitle={subtitle} />
  );
}
