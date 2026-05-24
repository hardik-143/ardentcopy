import type * as React from "react";
import {
  buttonSizeOptions,
  buttonVariantOptions,
  type ButtonSize,
  type ButtonVariant,
} from "@/utils/ui/components/button";

// Colors resolved from utils/ui/styles/globals.css :root tokens
const C = {
  primary: "#006574",          // --primary
  primaryFg: "#f6fbfb",        // --primary-foreground
  secondary: "#ec6100",        // --secondary
  secondaryFg: "#f6fbfb",      // --secondary-foreground
  destructive: "#1f1f1f",      // --destructive
  destructiveFg: "#ffffff",    // text-white (as in button.tsx)
  border: "#b0c2c2",           // --border  (outline border)
  foreground: "#061414",       // --foreground (ghost/outline resting text)
  shadow: "0px 5px 3px 0px hsl(0 0% 0% / 0.05)", // --shadow-xs
} as const;

// Mirrors CVA size definitions in utils/ui/components/button.tsx
// default: h-9 px-4 py-2   → 36px tall, 16px h-pad, 8px v-pad
// sm:      h-8 px-3 gap-1.5 → 32px tall, 12px h-pad, gap 6px
// lg:      h-12 px-6        → 48px tall, 24px h-pad
// icon:    size-9            → 36×36 square
const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  default: { height: 36, padding: "8px 16px", gap: 8 },
  sm:      { height: 32, padding: "0px 12px", gap: 6, borderRadius: 4 },
  lg:      { height: 48, padding: "0px 24px", gap: 8, borderRadius: 4 },
  icon:    { height: 36, width: 36, padding: 0, gap: 0 },
};

const sizeLabels: Record<ButtonSize, string> = {
  default: "Default (h-9)",
  sm:      "Small (h-8)",
  lg:      "Large (h-12)",
  icon:    "Icon (square)",
};

// Mirrors CVA variant definitions in utils/ui/components/button.tsx
// Resting state only (no hover)
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  // bg-primary text-primary-foreground shadow-xs
  default: {
    backgroundColor: C.primary,
    color: C.primaryFg,
    border: "none",
    boxShadow: C.shadow,
  },
  // bg-secondary text-secondary-foreground shadow-xs
  secondary: {
    backgroundColor: C.secondary,
    color: C.secondaryFg,
    border: "none",
    boxShadow: C.shadow,
  },
  // bg-destructive text-white shadow-xs
  destructive: {
    backgroundColor: C.destructive,
    color: C.destructiveFg,
    border: "none",
    boxShadow: C.shadow,
  },
  // border shadow-xs (border-color = --border), text = foreground
  outline: {
    backgroundColor: "transparent",
    color: C.foreground,
    border: `1px solid ${C.border}`,
    boxShadow: C.shadow,
  },
  // no bg, no border at rest, text = foreground
  ghost: {
    backgroundColor: "transparent",
    color: C.foreground,
    border: "none",
  },
  // text-primary underline-offset-4
  link: {
    backgroundColor: "transparent",
    color: C.primary,
    border: "none",
    textDecoration: "underline",
    textUnderlineOffset: "4px",
    padding: "0",
    height: "auto",
    width: "auto",
  },
};

const variantLabels: Record<ButtonVariant, string> = {
  default:     "Default — Primary teal",
  secondary:   "Secondary — Orange",
  destructive: "Destructive — Dark",
  outline:     "Outline — Border only",
  ghost:       "Ghost — No bg / no border",
  link:        "Link — Text + underline",
};

export type ButtonPreviewProps = {
  text?: string;
  variant?: string;
  size?: string;
};

const isButtonVariant = (value: string): value is ButtonVariant =>
  buttonVariantOptions.includes(value as ButtonVariant);

const isButtonSize = (value: string): value is ButtonSize =>
  buttonSizeOptions.includes(value as ButtonSize);

export function ButtonPreview({ text = "Button", variant = "default", size = "default" }: ButtonPreviewProps) {
  const v = isButtonVariant(variant) ? variant : "default";
  const s = isButtonSize(size) ? size : "default";

  // Base styles mirror CVA base: rounded-md font-medium text-sm
  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,   // rounded-md ≈ 4px (--radius = 0.375rem)
    fontSize: 14,      // text-sm
    fontWeight: 500,   // font-medium
    fontFamily: "Roboto, ui-sans-serif, system-ui, sans-serif",
    letterSpacing: "0em",
    whiteSpace: "nowrap",
    cursor: "default",
    ...sizeStyles[s],
    ...variantStyles[v],
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "24px",
        borderRadius: 10,
        backgroundColor: "#f1f6f6", // --background
        border: "1px solid #b0c2c2", // --border
        minHeight: 88,
      }}
    >
      <button type="button" style={buttonStyle}>
        {s === "icon" ? "▶" : text}
      </button>
      <span
        style={{
          fontSize: 11,
          color: "#006574", // --primary
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {variantLabels[v]} · {sizeLabels[s]}
      </span>
    </div>
  );
}
