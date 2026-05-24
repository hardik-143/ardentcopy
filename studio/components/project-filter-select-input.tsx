"use client";

import {
  Box,
  Card,
  Checkbox,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ArrayOfPrimitivesInputProps, set, unset } from "sanity";

import { getPresentationUrl } from "@studio/utils/helper";

type FilterKey = "city_states" | "project_types" | "materials_used";

type FilterOptions = Record<FilterKey, string[]>;

type FiltersApiResponse = {
  showcase?: {
    filters?: Array<Partial<FilterOptions>>;
  };
};

type FilterSelectInputProps = ArrayOfPrimitivesInputProps<
  string | number | boolean
>;

function isFilterKey(value: string): value is FilterKey {
  return (
    value === "city_states" ||
    value === "project_types" ||
    value === "materials_used"
  );
}

function getFilterKey(props: FilterSelectInputProps): FilterKey | null {
  const fieldName = props.path[props.path.length - 1];

  if (typeof fieldName === "string" && isFilterKey(fieldName)) {
    return fieldName;
  }

  return null;
}

function normalizeOptions(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right)
  );
}

export function ProjectFilterSelectInput(props: FilterSelectInputProps) {
  const { onChange, readOnly, value } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = getFilterKey(props);
  const isTriggerDisabled = readOnly || isLoading || (!!error && options.length === 0);
  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []),
    [value]
  );

  useEffect(() => {
    const activeFilterKey = filterKey;

    if (!activeFilterKey) {
      setOptions([]);
      setIsLoading(false);
      setError("Unknown filter field.");
      return;
    }

    const controller = new AbortController();

    async function loadOptions() {
      setIsLoading(true);
      setError(null);

      try {
        const url = new URL("/api/projects/filters", getPresentationUrl());
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload: FiltersApiResponse = await response.json();
        const nextOptions = normalizeOptions(
          payload.showcase?.filters?.[0]?.[activeFilterKey as FilterKey]
        );
        setOptions(nextOptions);
      } catch (_loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setOptions([]);
        setError("Could not load project filter options.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadOptions();

    return () => {
      controller.abort();
    };
  }, [filterKey]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const toggleValue = useCallback(
    (option: string) => {
      const nextValues = selectedValues.includes(option)
        ? selectedValues.filter((selectedValue) => selectedValue !== option)
        : [...selectedValues, option];

      onChange(nextValues.length > 0 ? set(nextValues) : unset());
    },
    [onChange, selectedValues]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  const selectedSummary = useMemo(() => {
    if (selectedValues.length === 0) {
      return "Choose filters";
    }

    if (selectedValues.length <= 2) {
      return selectedValues.join(", ");
    }

    return `${selectedValues.slice(0, 2).join(", ")} +${selectedValues.length - 2}`;
  }, [selectedValues]);

  if (!filterKey) {
    return (
      <Text muted size={1}>
        This filter field is not configured correctly.
      </Text>
    );
  }

  return (
    <Stack space={3} ref={containerRef}>
      <Card
        as="button"
        aria-expanded={open}
        border
        disabled={isTriggerDisabled}
        onClick={() => setOpen((currentValue) => !currentValue)}
        padding={3}
        radius={2}
        shadow={1}
        style={{
          cursor: isTriggerDisabled ? "not-allowed" : "pointer",
          opacity: isTriggerDisabled ? 0.6 : 1,
          textAlign: "left",
          width: "100%",
        }}
        tone={selectedValues.length > 0 ? "primary" : "default"}
      >
        <Flex align="center" gap={2}>
          <Box flex={1}>
            <Text size={1} weight="medium">
              {selectedSummary}
            </Text>
          </Box>
        </Flex>
      </Card>

      {isLoading ? (
        <Flex align="center" gap={2}>
          <Spinner muted />
          <Text muted size={1}>
            Loading available filter values…
          </Text>
        </Flex>
      ) : null}

      {error ? (
        <Text muted size={1}>
          {error}
        </Text>
      ) : null}

      {!isLoading && !error && options.length === 0 ? (
        <Text muted size={1}>
          No filter values were returned from the projects filters API.
        </Text>
      ) : null}

      {!isLoading && !error && open && options.length > 0 ? (
        <Card border padding={3} radius={2} shadow={1}>
          <Stack space={3}>
            <TextInput
              disabled={readOnly}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search filter values..."
              value={query}
            />

            {filteredOptions.length > 0 ? (
              <Card
                border
                padding={2}
                radius={2}
                style={{ maxHeight: "18rem", overflowY: "auto" }}
              >
                <Stack space={2}>
                  {filteredOptions.map((option) => {
                    const checked = selectedValues.includes(option);

                    return (
                      <Card
                        key={option}
                        as="label"
                        padding={2}
                        radius={2}
                        tone={checked ? "primary" : "default"}
                      >
                        <Flex align="center" gap={2}>
                          <Checkbox
                            checked={checked}
                            disabled={readOnly}
                            onChange={() => toggleValue(option)}
                          />
                          <Box flex={1}>
                            <Text size={1}>{option}</Text>
                          </Box>
                        </Flex>
                      </Card>
                    );
                  })}
                </Stack>
              </Card>
            ) : (
              <Text muted size={1}>
                No matching filter values found.
              </Text>
            )}
          </Stack>
        </Card>
      ) : null}

      <Text muted size={1}>
        Selected: {selectedValues.length}
      </Text>
    </Stack>
  );
}
