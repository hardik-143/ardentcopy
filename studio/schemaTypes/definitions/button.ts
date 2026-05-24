import { defineField, defineType } from "sanity";
import { buttonSizeOptions, buttonVariantOptions } from "@/utils/ui/components/button";

import { ButtonInput } from "@studio/components/button-input";
import { capitalize, createRadioListLayout } from "@studio/utils/helper";

export const button = defineType({
  name: "button",
  title: "Button",
  type: "object",
  components: {
    input: ButtonInput,
  },
  fields: [
    defineField({
      name: "variant",
      type: "string",
      description:
        "Choose the button's visual style - default is solid, secondary is less prominent, outline has a border, ghost is transparent, destructive is for dangerous actions, and link looks like regular text",
      initialValue: () => "default",
      options: createRadioListLayout([...buttonVariantOptions], {
        direction: "horizontal",
      }),
    }),
    defineField({
      name: "size",
      type: "string",
      description:
        "Controls the button's height and padding — default is standard (h-9), sm is compact (h-8), lg is larger (h-12), icon is a square (size-9)",
      initialValue: () => "default",
      options: createRadioListLayout([...buttonSizeOptions], {
        direction: "horizontal",
      }),
    }),
    defineField({
      name: "text",
      title: "Button Text",
      type: "string",
      description:
        "The text that appears on the button, like 'Learn More' or 'Get Started'",
    }),
    defineField({
      name: "url",
      title: "Url",
      type: "customUrl",
      description:
        "Where the button links to - can be an internal page or external website",
    }),
  ],
  preview: {
    select: {
      title: "text",
      variant: "variant",
      size: "size",
      externalUrl: "url.external",
      urlType: "url.type",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
    },
    prepare: ({
      title,
      variant,
      size,
      externalUrl,
      urlType,
      internalUrl,
      openInNewTab,
    }) => {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const sizeLabel = size && size !== "default" ? ` · ${size.toUpperCase()}` : "";

      return {
        title: title || "Untitled Button",
        subtitle: `${capitalize(variant ?? "default")}${sizeLabel} • ${url ?? ""}${newTabIndicator}`,
        text: title,
        variant,
        size,
      };
    },
  },
});
