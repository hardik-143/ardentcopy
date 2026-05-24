export const env = {
  NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
  NEXT_PUBLIC_BASE_URL:
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  /** Google Tag Manager container ID (e.g. GTM-XXXXXXX). Omit or leave empty to disable. */
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID ?? "",
};
