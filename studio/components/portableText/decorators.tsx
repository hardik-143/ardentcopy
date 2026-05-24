import type { BlockAnnotationProps } from "sanity";
import type { ReactNode } from "react";

export interface DecoratorProps {
  children: ReactNode;
}

interface LinkDecoratorProps {
  children: ReactNode;
  value?: { href?: string };
}

const HighlightDecorator = ({ children }: DecoratorProps) => (
  <span style={{ color: "#c4d600" }}>{children}</span>
);

/** Annotation renderer – reads the chosen color from the annotation value */
const HighlightAnnotation = (props: BlockAnnotationProps) => {
  const color =
    (props.value as { color?: string } | undefined)?.color ?? "#c4d600";
  return (
    <span
      className="highlight-annotation"
      style={{ color, textDecoration: "none" }}
    >
      <style>
        {`.highlight-annotation * { color: inherit !important; border-bottom: none !important; text-decoration: none !important; }`}
      </style>
      {props.renderDefault(props)}
    </span>
  );
};

const LinkDecorator = ({ children, value }: LinkDecoratorProps) => {
  const href = value?.href ?? "#";
  return (
    <a
      href={href}
      style={{ color: "#1E90FF", textDecoration: "underline" }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const AnchorDecorator = ({ children }: DecoratorProps) => {
  const text = Array.isArray(children) ? ((children[0] as string) ?? "") : "";
  const urlMatch =
    typeof text === "string" ? text.match(/https?:\/\/[^\s]+/) : null;
  const href = urlMatch?.[0] ?? "#";
  return (
    <a
      href={href}
      style={{ color: "#1E90FF", textDecoration: "underline" }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );
};

export {
  HighlightDecorator,
  HighlightAnnotation,
  LinkDecorator,
  AnchorDecorator,
};
