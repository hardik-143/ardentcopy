import { assist } from "@sanity/assist";
// import { table } from "@sanity/table";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { media } from "sanity-plugin-media";
import seofields, { seoFieldsGroup } from "../utils/sanity/plugin";

import { Logo } from "./components/logo";
import { locations } from "./location";
import { presentationUrl } from "./plugins/presentation-url";
import { schemaTypes } from "./schemaTypes/index";
import { structure } from "./structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const title = process.env.NEXT_PUBLIC_SANITY_STUDIO_TITLE ?? "Studio";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const presentationInitialUrl = ({ origin }: { origin: string }) => {
  const studioUrl = new URL(origin);
  const isStandaloneStudio =
    studioUrl.hostname.endsWith(".sanity.studio") || studioUrl.port === "3333";

  return isStandaloneStudio ? baseUrl : origin;
};

export default defineConfig({
  name: "default",
  title,
  icon: Logo,
  projectId,
  dataset,
  basePath: "/studio",
  releases: {
    enabled: true,
  },
  plugins: [
    structureTool({
      structure,
    }),
    presentationTool({
      resolve: {
        locations,
        mainDocuments: [
          {
            route: "/",
            type: "homePage",
          },
          {
            route: "/blog",
            type: "blogIndex",
          },
          {
            route: "/careers",
            type: "careersIndex",
          },
          {
            route: "/glossary",
            type: "glossaryIndex",
          },
          {
            route: "/blog/:slug",
            resolve: ({ path }) => ({
              filter: '_type == "blog" && slug.current == $path',
              params: { path },
            }),
          },
          {
            route: [
              "/:slug",
              "/:slug1/:slug2",
              "/:slug1/:slug2/:slug3",
              "/:slug1/:slug2/:slug3/:slug4",
            ],
            resolve: ({ path }) =>
              path.startsWith("/api/")
                ? undefined
                : { filter: '_type == "page" && slug.current == $path', params: { path } },
          },
        ],
      },
      previewUrl: {
        initial: presentationInitialUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    presentationUrl(),
    visionTool(),
    lucideIconPicker(),
    unsplashImageAsset(),
    media(),
    // table(),
    assist(),
    seofields({
      fieldGroups: seoFieldsGroup,
      healthDashboard: false,
    }),
  ],
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;
      if (type === "global") {
        return prev.filter(
          (template) =>
            ![
              "homePage",
              "navbar",
              "footer",
              "settings",
              "blogIndex",
              "assist.instruction.context",
              "media.tag",
            ].includes(template?.templateId)
        );
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
    templates: [
      {
        id: "nested-page-template",
        title: "Nested Page",
        schemaType: "page",
        value: (props: { slug?: string; title?: string }) => ({
          ...(props.slug
            ? { slug: { current: props.slug, _type: "slug" } }
            : {}),
          ...(props.title ? { title: props.title } : {}),
        }),
        parameters: [
          {
            name: "slug",
            type: "string",
          },
        ],
      },
    ],
  },
});
