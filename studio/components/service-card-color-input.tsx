"use client";

import { Box, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback } from "react";
import { type StringInputProps, set, unset } from "sanity";

const DEFAULT_COLOR = "#39bfd6";
const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.slice(0, 7);
}

export function ServiceCardColorInput(props: StringInputProps) {
  const { value, onChange } = props;
  const currentValue =
    typeof value === "string" && HEX_PATTERN.test(value)
      ? value
      : DEFAULT_COLOR;

  const commitValue = useCallback(
    (nextValue: string) => {
      const normalizedValue = normalizeHex(nextValue);

      if (!normalizedValue) {
        onChange(unset());
        return;
      }

      onChange(set(normalizedValue));
    },
    [onChange]
  );

  return (
    <Stack space={3}>
      <Flex align="center" gap={3}>
        <input
          aria-label="Choose service card color"
          onChange={(event) => commitValue(event.currentTarget.value)}
          style={{
            width: "3rem",
            height: "3rem",
            border: "none",
            borderRadius: "999px",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
          }}
          type="color"
          value={currentValue}
        />
        <Box flex={1}>
          <TextInput
            onChange={(event) => commitValue(event.currentTarget.value)}
            value={value ?? ""}
          />
        </Box>
      </Flex>
      <Text muted size={1}>
        Enter a hex value like `#39bfd6`.
      </Text>
    </Stack>
  );
}
