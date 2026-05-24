"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, ChevronDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/ui/lib/utils";
import { sanitizeText } from "@/textSanitizer";
import { TitleWithHighlight } from "./elements/title-with-highlight";

export interface Project {
  id: string;
  title: string;
  city: string;
  state: string;
  zipcode: string;
  latestActivityAt: string;
  featuredPhoto: string;
  materials: string[];
  types: string[];
  mediaCount: number;
  media: { id: string; url: string }[];
}

interface FiltersData {
  city_states: string[];
  project_types: string[];
  materials_used: string[];
}

export interface FiltersResponse {
  company_name: string;
  filters: FiltersData[];
}

interface AppliedFilters {
  project_types: string[];
  city_states: string[];
  materials_used: string[];
}

export interface ProjectListingFiltersInput {
  project_types?: readonly (string | null | undefined)[] | null;
  city_states?: readonly (string | null | undefined)[] | null;
  materials_used?: readonly (string | null | undefined)[] | null;
}

type FilterKey = keyof AppliedFilters;

const LIMIT = 15;

const EMPTY_FILTERS_DATA: FiltersData = {
  city_states: [],
  project_types: [],
  materials_used: [],
};

function normalizeFilterValues(
  values?: readonly (string | null | undefined)[] | null
): string[] {
  return (values ?? [])
    .map((value) => {
      if (typeof value !== "string") return null;
      return sanitizeText(value).trim();
    })
    .filter((value): value is string => Boolean(value));
}

function normalizeFilters(filters?: ProjectListingFiltersInput | null): AppliedFilters {
  return {
    project_types: normalizeFilterValues(filters?.project_types),
    city_states: normalizeFilterValues(filters?.city_states),
    materials_used: normalizeFilterValues(filters?.materials_used),
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

// --- Project card ---

function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse bg-[#244a51] min-h-[400px]">
      <div className="aspect-[4/3] bg-white/5" />
      <div className="p-6 sm:p-8">
        <div className="mb-6 h-8 w-4/5 rounded bg-white/10" />
        <div className="space-y-4">
          <div className="h-4 w-1/3 rounded bg-white/5" />
          <div className="h-4 w-2/3 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const thumbs = project.media.slice(0, 4);

  return (
    <article className="group relative flex h-full min-h-[480px] flex-col overflow-hidden bg-[#244a51] text-white transition-all duration-300 border border-white/5 hover:border-white/20">
      <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.featuredPhoto}
          alt={project.title}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between p-4 sm:p-6">
          <span className="rounded-full bg-black/50 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/10">
            {formatDate(project.latestActivityAt)}
          </span>
          <span className="rounded-full bg-black/50 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/10">
            {project.city}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-8 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
             <h3 className="mb-0 text-balance font-semibold text-2xl leading-[1.1] text-white sm:text-3xl">
              {project.title}
            </h3>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 group-hover:border-[#39bfd6]/40 group-hover:bg-[#39bfd6]/10 group-hover:text-[#39bfd6]">
            <ArrowUpRight
              aria-hidden
              className="size-6 transition-transform duration-300 group-hover:rotate-45"
              strokeWidth={2}
            />
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {project.types.length > 0 && (
            <div>
              <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50">
                Project Type
              </p>
              <p className="text-[0.95rem] leading-relaxed text-white/80">
                {project.types.join(", ")}
              </p>
            </div>
          )}

          {project.materials.length > 0 && (
            <div>
              <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/50">
                Products Used
              </p>
              <p className="text-[0.95rem] leading-relaxed text-white/80 !m-0">
                {project.materials.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {thumbs.length > 0 && (
        <div className="grid shrink-0 grid-cols-4 gap-2 border-t border-white/5 p-3">
          {thumbs.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square w-full overflow-hidden rounded-sm border border-white/10 bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt=""
                className="size-full object-cover transition-transform duration-500 min-h-full hover:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

// --- Filter dropdown ---

function FilterDropdown({
  label,
  options,
  applied,
  onApply,
}: {
  label: string;
  options: string[];
  applied: string[];
  onApply: (selected: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string[]>(applied);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = applied.length > 0;

  useEffect(() => {
    if (!open) setPending(applied);
  }, [applied, open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPending(applied);
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, applied]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(option: string) {
    setPending((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  }

  function handleOpen() {
    setPending(applied);
    setOpen(true);
    setSearch("");
  }

  function handleSave() {
    onApply(pending);
    setOpen(false);
    setSearch("");
  }

  function handleCancel() {
    setPending(applied);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={open ? handleCancel : handleOpen}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.82rem] font-semibold transition-all uppercase tracking-wider",
          open || isActive
            ? "border-white bg-white text-[#0b3033]"
            : "border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white"
        )}
      >
        {label}
        {isActive && !open ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0b3033] text-[0.65rem] font-bold text-white">
            {applied.length}
          </span>
        ) : null}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl bg-[#123940] border border-white/10 shadow-2xl shadow-black/50">
          <div className="border-b border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
              <Search
                aria-hidden
                className="size-4 shrink-0 text-white/40"
                strokeWidth={2}
              />
              <input
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <ul className="max-h-60 divide-y divide-white/5 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-4 text-center text-sm text-white/30">
                No results
              </li>
            ) : (
              filtered.map((option) => {
                const checked = pending.includes(option);
                return (
                  <li key={option}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggle(option)}
                      />
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-all",
                          checked
                            ? "border-[#39bfd6] bg-[#39bfd6]"
                            : "border-white/20 bg-transparent"
                        )}
                      >
                        {checked ? (
                          <ChevronDown className="size-3 text-[#0b3033]" strokeWidth={4} />
                        ) : null}
                      </span>
                      <span className={cn(
                        "text-sm transition-colors",
                        checked ? "text-white font-medium" : "text-white/70"
                      )}>{option}</span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-3">
            <button
              type="button"
              onClick={() => setPending([])}
              className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-white"
            >
              Clear
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="text-[0.7rem] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-[#39bfd6] px-5 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-[#0b3033] transition-colors hover:bg-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// --- Main component ---

export function ProjectsPageContent({
  badge,
  title,
  subtitle,
  showFilters = true,
  initialFilters,
}: {
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  showFilters?: boolean;
  initialFilters?: ProjectListingFiltersInput | null;
} = {}) {
  const normalizedInitialFilters = useMemo(
    () => normalizeFilters(initialFilters),
    [initialFilters]
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData>(EMPTY_FILTERS_DATA);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasInitialProjects, setHasInitialProjects] = useState(true);
  const [appliedFilters, setAppliedFilters] =
    useState<AppliedFilters>(normalizedInitialFilters);

  const skipRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const filtersRef = useRef<AppliedFilters>(normalizedInitialFilters);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildUrl = useCallback(
    (skip: number, filters: AppliedFilters): string => {
      const params = new URLSearchParams();
      params.set("limit", String(LIMIT));
      params.set("skip", String(skip));
      filters.project_types.forEach((t) => {
        params.append("project_types[]", t);
      });
      filters.city_states.forEach((c) => {
        params.append("city_states[]", c);
      });
      filters.materials_used.forEach((m) => {
        params.append("materials_used[]", m);
      });
      return `/api/projects?${params.toString()}`;
    },
    []
  );

  // Initial load: fetch filters + first page of projects in parallel
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setAppliedFilters(normalizedInitialFilters);
      filtersRef.current = normalizedInitialFilters;
      skipRef.current = 0;
      hasMoreRef.current = true;
      setHasInitialProjects(true);
      setInitialLoading(true);

      try {
        const projectsPromise = fetch(buildUrl(0, normalizedInitialFilters));
        const filtersPromise = showFilters
          ? fetch("/api/projects/filters")
          : Promise.resolve(null);

        const [projectsRes, filtersRes] = await Promise.all([
          projectsPromise,
          filtersPromise,
        ]);

        if (cancelled) return;

        const [projectsData, filtersJson] = await Promise.all([
          projectsRes.ok ? projectsRes.json() : [],
          filtersRes?.ok ? filtersRes.json() : null,
        ]);

        if (cancelled) return;

        const normalizedProjects = Array.isArray(projectsData) ? projectsData : [];
        setProjects(normalizedProjects);
        setHasInitialProjects(normalizedProjects.length > 0);
        skipRef.current = normalizedProjects.length;
        hasMoreRef.current =
          normalizedProjects.length === LIMIT;

        if (showFilters && filtersJson?.showcase && filtersJson?.showcase?.filters?.[0]) {
          setFiltersData(filtersJson.showcase.filters[0]);
        }
      } catch (err) {
        console.error("[projects] init failed:", err);
        setHasInitialProjects(false);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [buildUrl, normalizedInitialFilters, showFilters]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch(buildUrl(skipRef.current, filtersRef.current));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Project[] = await res.json();
      setProjects((prev) => [...prev, ...data]);
      skipRef.current += data.length;
      hasMoreRef.current = data.length === LIMIT;
    } catch (err) {
      console.error("[projects] loadMore failed:", err);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [buildUrl]);

  const resetAndFetch = useCallback(
    async (filters: AppliedFilters) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setFilterLoading(true);
      skipRef.current = 0;
      filtersRef.current = filters;
      try {
        const res = await fetch(buildUrl(0, filters));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Project[] = await res.json();
        setProjects(data);
        skipRef.current = data.length;
        hasMoreRef.current = data.length === LIMIT;
      } catch (err) {
        console.error("[projects] resetAndFetch failed:", err);
        setProjects([]);
        hasMoreRef.current = false;
      } finally {
        loadingRef.current = false;
        setFilterLoading(false);
      }
    },
    [buildUrl]
  );

  // Infinite scroll
  useEffect(() => {
    if (initialLoading || filterLoading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filterLoading, loadMore, initialLoading]);

  function handleFilterApply(key: FilterKey, selected: string[]) {
    const newFilters = { ...appliedFilters, [key]: selected };
    setAppliedFilters(newFilters);
    resetAndFetch(newFilters);
  }

  if (!initialLoading && !hasInitialProjects) {
    return null;
  }

  return (
    <>
      {/* Hero */}
      <section
        className="relative isolate w-screen max-w-none overflow-hidden bg-[#0b3033] [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)]"
        id="projects-hero"
      >
        <div className="relative mx-auto max-w-[1540px] px-4 pt-16 md:px-6 ">
          <div className="min-w-0 max-w-5xl">
            {(badge ?? "Our Work") ? (
              <p className="mb-0 text-[0.72rem] font-semibold text-[#d48d4d] uppercase tracking-[0.32em]">
                {badge ?? "Our Work"}
              </p>
            ) : null}
            <h1 className="mb-0 mt-3 text-balance font-semibold text-white">
               <TitleWithHighlight
                highlightClassName="text-[#d48d4d]"
                title={title ?? "Project Gallery"}
                className="block text-3xl leading-[1.05] sm:text-4xl sm:leading-[1.04] lg:text-5xl lg:leading-[1.02]"
              />
            </h1>
            {(subtitle ?? true) ? (
              <p className="mb-0 mt-6 w-full max-w-2xl shrink-0 text-pretty text-base leading-relaxed text-white/75 lg:text-[1.05rem] lg:leading-8">
                {subtitle ??
                  "Browse our recent carpet cleaning, repair, and restoration projects across the Sacramento area."}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {showFilters ? (
        <div className="sticky top-16 lg:top-24 z-30 w-screen max-w-none border-b border-white/8 bg-[#0b3033] [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)]">
          <div className="mx-auto max-w-[1540px] px-4 md:px-6">
            <div className="flex flex-wrap items-center gap-3 py-6">
              <FilterDropdown
                label="Project Type"
                options={filtersData.project_types}
                applied={appliedFilters.project_types}
                onApply={(s) => handleFilterApply("project_types", s)}
              />
              <FilterDropdown
                label="Products Used"
                options={filtersData.materials_used}
                applied={appliedFilters.materials_used}
                onApply={(s) => handleFilterApply("materials_used", s)}
              />
              <FilterDropdown
                label="City & State"
                options={filtersData.city_states}
                applied={appliedFilters.city_states}
                onApply={(s) => handleFilterApply("city_states", s)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Projects grid */}
      <section
        aria-label="Projects gallery"
        className="w-screen max-w-none bg-[#0b3033] py-16 [margin-left:calc(50%-50vw)] [margin-right:calc(50%-50vw)] md:py-24"
      >
        <div className="mx-auto max-w-[1540px] px-4 md:px-6">
          {initialLoading || filterLoading ? (
            /* Initial skeleton grid */
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex min-h-100 items-center justify-center">
              <p className="text-lg text-white/40 font-medium">
                No projects found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {loadingMore ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProjectCardSkeleton key={`loading-more-${index}`} />
              ))}
            </div>
          ) : null}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="mt-20 h-px w-full" aria-hidden />
        </div>
      </section>
    </>
  );
}
