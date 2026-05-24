import { ImageIcon, LinkIcon } from "@sanity/icons";

import { customUrl } from "@studio/schemaTypes/definitions/custom-url";

type BlogBlockConfig = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  ul?: boolean;
  ol?: boolean;
  links?: boolean;
};

const isEnabled = (val: boolean | undefined) => val !== false;

export function createBlogBlock(config: BlogBlockConfig = {}) {
  const { bold, italic, code, ul, ol, links } = config;

  const decorators = [];
  if (isEnabled(bold)) decorators.push({ title: "Strong", value: "strong" });
  if (isEnabled(italic)) decorators.push({ title: "Emphasis", value: "em" });
  if (isEnabled(code)) decorators.push({ title: "Code", value: "code" });

  const lists = [];
  if (isEnabled(ul)) lists.push({ title: "Bullet", value: "bullet" });
  if (isEnabled(ol)) lists.push({ title: "Numbered", value: "number" });

  const annotations = [];
  if (isEnabled(links)) {
    annotations.push({
      name: "link",
      type: "object",
      title: "Link",
      icon: LinkIcon,
      fields: customUrl.fields,
    });
  }

  return {
    type: "block" as const,
    styles: [{ title: "Normal", value: "normal" }],
    lists,
    marks: { decorators, annotations },
  };
}

export const floatingImageBlock = {
  name: "floatingImage",
  type: "object",
  title: "Floating Image",
  icon: ImageIcon,
  fields: [
    {
      name: "image",
      type: "image",
      title: "Image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alt Text" },
      ],
    },
    {
      name: "position",
      type: "string",
      title: "Float Position",
      initialValue: "left",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
    },
    {
      name: "maxWidth",
      type: "number",
      title: "Max Width (px)",
      description: "Maximum width of the floating image in pixels (default 200)",
      initialValue: 200,
    },
  ],
} as const;

export const codeLanguages = [
  { title: "JavaScript", value: "js" },
  { title: "TypeScript", value: "ts" },
  { title: "CSS", value: "css" },
  { title: "HTML", value: "html" },
  { title: "Bash", value: "bash" },
  { title: "Shell", value: "shell" },
  { title: "JSON", value: "json" },
];
