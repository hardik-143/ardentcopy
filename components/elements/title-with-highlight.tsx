import { cleanString } from "@/utils";

export type TitleWithHighlightProps = {
  /** Main text to display; optional part can be highlighted. */
  title?: string | null;
  /** Substring to highlight (case-insensitive match, preserves casing). Must appear in title. */
  highlightedText?: string | null;
  /** Optional class for the highlighted span. Defaults to "text-primary". */
  highlightClassName?: string;
  /** Optional class for the wrapper span (e.g. "whitespace-nowrap"). */
  className?: string;
};

/** Renders title with optional highlighted substring (case-insensitive match, preserves casing). */
export function TitleWithHighlight({
  title,
  highlightedText,
  highlightClassName = "text-primary",
  className,
}: TitleWithHighlightProps) {
  if (!title) return null;
  if (!highlightedText?.trim()) return <>{title}</>;

  const cleanTitle = cleanString(title);
  const cleanHighlight = cleanString(highlightedText);
  const index = cleanTitle.toLowerCase().indexOf(cleanHighlight.toLowerCase());

  if (index === -1) {
    return <>{cleanTitle}</>;
  }

  return (
    <span className={className}>
      {cleanTitle.slice(0, index)}
      <span className={highlightClassName}>
        {cleanTitle.slice(index, index + cleanHighlight.length)}
      </span>
      {cleanTitle.slice(index + cleanHighlight.length)}
    </span>
  );
}
