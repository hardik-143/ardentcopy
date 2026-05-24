"use client";

import { useEffect, useMemo, useState } from "react";
import type { PreviewProps } from "sanity";

import { MapPin } from "lucide-react";

import { getPresentationUrl } from "@studio/utils/helper";

type FilterKey = "city_states" | "materials_used" | "project_types";

type SelectedFilters = Partial<Record<FilterKey, string[]>>;

type SingleLocationProjectsPreviewProps = PreviewProps & SelectedFilters;

type ProjectCountResponse = {
  filteredCount?: number;
  totalCount?: number;
};

function normalizeFilterValues(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right)
  );
}

function formatSelectionCount(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function formatProjectCountLabel(count: number | null, isLoading: boolean, hasError: boolean): string {
  if (isLoading) {
    return "Loading project count…";
  }

  if (hasError) {
    return "Project count unavailable";
  }

  if (count === null) {
    return "Project count pending";
  }

  return `${count} project${count === 1 ? "" : "s"}`;
}

export function SingleLocationProjectsPreview(
  props: SingleLocationProjectsPreviewProps
) {
  const { city_states, materials_used, project_types, renderDefault, title } = props;
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const normalizedFilters = useMemo(
    () => ({
      city_states: normalizeFilterValues(city_states),
      materials_used: normalizeFilterValues(materials_used),
      project_types: normalizeFilterValues(project_types),
    }),
    [city_states, materials_used, project_types]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("includeCount", "true");
    params.set("limit", "1");
    params.set("skip", "0");

    normalizedFilters.project_types.forEach((value) => {
      params.append("project_types[]", value);
    });
    normalizedFilters.city_states.forEach((value) => {
      params.append("city_states[]", value);
    });
    normalizedFilters.materials_used.forEach((value) => {
      params.append("materials_used[]", value);
    });

    return params.toString();
  }, [normalizedFilters]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjectCount() {
      setIsLoading(true);
      setHasError(false);

      try {
        const url = new URL("/api/projects", getPresentationUrl());
        url.search = queryString;

        const response = await fetch(url.toString(), {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload: ProjectCountResponse = await response.json();
        const count = payload.filteredCount ?? payload.totalCount ?? 0;
        setProjectCount(count);
      } catch (_error) {
        if (controller.signal.aborted) {
          return;
        }

        setProjectCount(null);
        setHasError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProjectCount();

    return () => {
      controller.abort();
    };
  }, [queryString]);

  const selectionSummary = [
    formatSelectionCount(normalizedFilters.city_states.length, "location"),
    formatSelectionCount(normalizedFilters.project_types.length, "type"),
    formatSelectionCount(normalizedFilters.materials_used.length, "product"),
  ];

  return renderDefault({
    ...props,
    media: <MapPin size={16} />,
    subtitle: formatProjectCountLabel(projectCount, isLoading, hasError) + " matching filters : " + selectionSummary.join(" • "),
    title: title || "Single Location Projects",
  });
}

