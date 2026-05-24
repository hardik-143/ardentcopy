/**
 * Utility functions to sanitize text content and prevent DOM errors
 * from invisible Unicode characters
 */

/**
 * Removes invisible Unicode characters that can cause DOM errors
 * Includes: zero-width spaces, non-breaking spaces, invisible separators, etc.
 */
export function sanitizeText(text: string): string {
  if (typeof text !== "string") return "";

  return (
    text
      // Remove zero-width characters and invisible separators
      .replace(/[\u200B-\u200D\uFEFF\u00A0\u2000-\u206F]/g, "")
      // Remove other problematic invisible characters
      .replace(/[\u180E\u061C\u2066-\u2069]/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Sanitizes HTML tag names to ensure they're valid
 */
export function sanitizeTagName(
  tagName: string,
  fallback: string = "div"
): string {
  if (typeof tagName !== "string") return fallback;

  // Remove all non-alphanumeric characters
  const sanitized = tagName.toLowerCase().replace(/[^\w]/g, "");

  // Validate against known HTML tags
  const validTags = [
    "div",
    "span",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "article",
    "section",
    "header",
    "footer",
    "main",
    "aside",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "blockquote",
    "pre",
    "code",
    "em",
    "strong",
    "a",
  ];

  return validTags.includes(sanitized) ? sanitized : fallback;
}

/**
 * Safely creates heading tag names with fallback
 */
export function sanitizeHeadingLevel(
  level: string | undefined
): "h1" | "h2" | "h3" | "h4" | "h5" | "h6" {
  const sanitized = sanitizeTagName(level ?? "h2");
  const validHeadings: ("h1" | "h2" | "h3" | "h4" | "h5" | "h6")[] = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ];

  return validHeadings.includes(
    sanitized as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  )
    ? (sanitized as "h1" | "h2" | "h3" | "h4" | "h5" | "h6")
    : "h2";
}

