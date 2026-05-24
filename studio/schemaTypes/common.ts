import {
  defineField,
  type ImageRule,
  type ImageValue,
  type ValidationBuilder,
} from "sanity";

import { PathnameFieldComponent } from "@studio/components/slug-field-component";
import { GROUP } from "@studio/utils/constant";
import {
  createSlugValidator,
  getDocumentTypeConfig,
} from "@studio/utils/slug-validation";

export const anchorIdField = defineField({
  name: "anchorId",
  title: "Anchor ID (optional)",
  type: "string",
  description:
    "Used as the HTML id on this section so it can be linked to with a # URL. Must be unique within this page.",
  validation: (Rule) => [
    Rule.custom((value) => {
      if (!value) return true;
      if (!/^[a-z0-9-_]+$/i.test(value)) {
        return "Only letters, numbers, hyphens, and underscores allowed";
      }
      return true;
    }),
    Rule.custom((value, { document }) => {
      if (!value) return true;
      const pb = (document as Record<string, unknown>)?.pageBuilder;
      if (!Array.isArray(pb)) return true;
      const count = (pb as Array<Record<string, unknown>>).filter(
        (b) => b.anchorId === value
      ).length;
      if (count > 1) return "Anchor ID must be unique on this page";
      return true;
    }),
  ],
});

export const richTextField = defineField({
  name: "richText",
  type: "richText",
  description:
    "A text editor that lets you add formatting like bold text, links, and bullet points",
});

export const buttonsField = defineField({
  name: "buttons",
  type: "array",
  of: [{ type: "button" }],
  description:
    "Add one or more clickable buttons that visitors can use to navigate your website",
});

const HERO_TYPES = ["heroPrimary", "heroSecondary"] as const;

function isHeroBlock(item: unknown): boolean {
  return (
    typeof item === "object" &&
    item !== null &&
    "_type" in item &&
    HERO_TYPES.includes((item as { _type: string })._type as (typeof HERO_TYPES)[number])
  );
}

export const pageBuilderField = defineField({
  name: "pageBuilder",
  group: GROUP.MAIN_CONTENT,
  type: "pageBuilder",
  description:
    "Build your page by adding different sections like text, images, and other content blocks. At most one hero block is allowed, and it must be the first block.",
  validation: (Rule) =>
    Rule.custom((value: unknown) => {
      if (!Array.isArray(value) || value.length === 0) return true;
      const heroIndices = value
        .map((item, index) => (isHeroBlock(item) ? index : -1))
        .filter((i) => i >= 0);
      if (heroIndices.length === 0) return true;
      if (heroIndices.length > 1) {
        return "Only one hero block (Hero Primary or Hero Secondary) is allowed per page.";
      }
      if (heroIndices[0] !== 0) {
        return "The hero block must be the first block at the top of the page.";
      }
      return true;
    }),
});

export const iconField = defineField({
  name: "icon",
  title: "Icon",
  options: {
    // storeSvg: true,
    // providers: ["fi"],
  },
  // type: "iconPicker",
  type: "lucide-icon",
  description:
    "Choose a small picture symbol to represent this item, like a home icon or shopping cart",
});

export const documentSlugField = (
  documentType: string,
  options: {
    group?: string;
    description?: string;
    title?: string;
  } = {}
) => {
  const {
    group,
    description = `The web address where people can find your ${documentType} (automatically created from title)`,
    title = "URL",
  } = options;

  return defineField({
    name: "slug",
    type: "slug",
    title,
    description,
    group,
    components: {
      field: PathnameFieldComponent,
    },
    validation: (Rule) => [
      Rule.required().error("A URL slug is required"),
      Rule.custom(createSlugValidator(getDocumentTypeConfig(documentType))),
    ],
  });
};

export const imageWithAltField = ({
  name = "image",
  title = "Image",
  description = "An image, make sure to add an alt text and use the hotspot tool to ensure if image is cropped it highlights the focus point",
  validation,
  group,
}: {
  name?: string;
  title?: string;
  description?: string;
  group?: string;
  validation?: ValidationBuilder<ImageRule, ImageValue>;
} = {}) =>
  defineField({
    name,
    type: "image",
    title,
    description,
    group,
    validation,
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alt Text",
        description:
          "The text that describes the image for screen readers and search engines",
      }),
    ],
  });
