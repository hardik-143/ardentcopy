import type { ObjectInputProps } from "sanity";

import { ButtonPreview } from "./button-preview";

type ButtonValue = {
  text?: string;
  variant?: string;
  size?: string;
};

export function ButtonInput(props: ObjectInputProps) {
  const value = (props.value ?? {}) as ButtonValue;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ButtonPreview text={value.text} variant={value.variant} size={value.size} />
      {props.renderDefault(props)}
    </div>
  );
}
