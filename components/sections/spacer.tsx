import { cleanString } from "@/utils";

export type SpacerBlockProps = {
  readonly _key: string;
  readonly _type: "spacer";
  readonly size?: "small" | "medium" | "large" | "xlarge";
  readonly showDivider?: boolean;
};

const SIZE_CLASSES: Record<string, string> = {
  small: "py-2 md:py-4",
  medium: "py-6 md:py-16",
  large: "py-12 md:py-24",
  xlarge: "py-16 md:py-32",
};

export function SpacerBlock({ size = "medium", showDivider }: SpacerBlockProps) {
  return (
    <div className={`flex items-center ${SIZE_CLASSES[cleanString(size)] ?? SIZE_CLASSES.medium}`}>
      {showDivider ? (
        <div className="container mx-auto px-4">
          <hr className="border-border" />
        </div>
      ) : null}
    </div>
  );
}
