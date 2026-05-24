import { SeoFieldGroup } from "sanity-plugin-seofields";

// Studio-side: re-export seofields plugin for use in sanity.config.ts
export { default } from "sanity-plugin-seofields";
const seoFieldsGroup: SeoFieldGroup[] = [
  {
    name: "meta",
    title: "Meta",
    fields: [
      "robots",
      "title",
      "description",
      "keywords",
      "metaImage",
      "canonicalUrl",
      "metaAttributes",
    ],
  },
  {
    name: "openGraph",
    title: "Open Graph",
    fields: ["openGraph"],
  },
  {
    name: "twitter",
    title: "Twitter",
    fields: ["twitter"],
  },
];

export { seoFieldsGroup };
