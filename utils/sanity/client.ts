import type { SanityImageSource } from "@sanity/asset-utils";
import { createImageUrlBuilder } from "@sanity/image-url";
import { createClient } from "next-sanity";

import { env } from "../env/client";

const clientConfig = {
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: env.NODE_ENV === "production",
  stega: {
    studioUrl: "/studio",
    enabled: true,
  },
} as const;

export const client = createClient({
  ...clientConfig,
  perspective: "published",
});

/**
 * Client with "raw" perspective so draft documents and references to drafts resolve.
 * Use for glossary so relatedTerms (which may reference draft ids) resolve correctly
 * until all glossary docs are published.
 */
export const clientRaw = createClient({
  ...clientConfig,
  perspective: "raw",
});

const imageBuilder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

export const urlFor = (source: SanityImageSource) =>
  imageBuilder.image(source).auto("format").quality(80).format("webp");
