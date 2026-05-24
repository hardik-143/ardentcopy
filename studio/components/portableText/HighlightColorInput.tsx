"use client";

import { useCallback } from "react";
import { type StringInputProps, set } from "sanity";

const HIGHLIGHT_COLORS = [
  { title: "Lime Green", value: "#c4d600" },
  { title: "Navy Blue", value: "#1b2d5e" },
] as const;

export default function HighlightColorInput(props: StringInputProps) {
  const { value, onChange } = props;

  const handleSelect = useCallback(
    (color: string) => {
      onChange(set(color));
    },
    [onChange],
  );

  return (
    <div style={{ display: "flex", gap: "10px", padding: "8px 0" }}>
      {HIGHLIGHT_COLORS.map((color) => {
        const isSelected = value === color.value;
        return (
          <button
            key={color.value}
            type="button"
            onClick={() => handleSelect(color.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: isSelected
                ? `2px solid ${color.value}`
                : "2px solid #ddd",
              background: isSelected ? `${color.value}12` : "#fff",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: color.value,
                border: "2px solid rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? color.value : "#333",
              }}
            >
              {color.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
