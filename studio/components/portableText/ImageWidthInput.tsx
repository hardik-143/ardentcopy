import { useCallback } from "react";
import { type StringInputProps, set } from "sanity";

const WIDTH_OPTIONS = [
  {
    title: "Full Width",
    value: "full",
    bars: 8,
  },
  {
    title: "75%",
    value: "75",
    bars: 6,
  },
  {
    title: "50%",
    value: "50",
    bars: 4,
  },
  {
    title: "25%",
    value: "25",
    bars: 2,
  },
] as const;

const TOTAL_BARS = 8;

export default function ImageWidthInput(props: StringInputProps) {
  const { value, onChange } = props;
  const current = value ?? "full";

  const handleSelect = useCallback(
    (val: string) => {
      onChange(set(val));
    },
    [onChange],
  );

  return (
    <div style={{ display: "flex", gap: "10px", padding: "8px 0", flexWrap: "wrap" }}>
      {WIDTH_OPTIONS.map((opt) => {
        const isSelected = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: isSelected ? "2px solid #0070f3" : "2px solid #ddd",
              background: isSelected ? "#e8f4ff" : "#fff",
              cursor: "pointer",
              transition: "all 0.15s ease",
              minWidth: "80px",
            }}
          >
            <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
              {Array.from({ length: TOTAL_BARS }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static visual bars
                  key={i}
                  style={{
                    width: "8px",
                    height: "20px",
                    borderRadius: "2px",
                    backgroundColor: i < opt.bars ? (isSelected ? "#0070f3" : "#555") : "#e0e0e0",
                    transition: "background-color 0.15s ease",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? "#0070f3" : "#333",
              }}
            >
              {opt.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
