import "./utils/env/client";
import "./utils/env/server";

import type { NextConfig } from "next";

import { env } from "./utils/env/client";
import { client } from "./utils/sanity/client";
import { queryRedirects } from "./utils/sanity/query";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Expose SANITY_STUDIO_* vars to the browser when studio is embedded in Next.js,
  // since only NEXT_PUBLIC_* vars are available client-side by default.
  env: {
    SANITY_STUDIO_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    SANITY_STUDIO_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    SANITY_STUDIO_TITLE: process.env.SANITY_STUDIO_TITLE ?? "",
    SANITY_STUDIO_PRESENTATION_URL:
      process.env.SANITY_STUDIO_PRESENTATION_URL ??
      process.env.NEXT_PUBLIC_SANITY_PRESENTATION_URL ??
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
      "http://localhost:3000",
  },
  experimental: {
    inlineCss: true,
  },
  logging: {
    fetches: {},
  },
  images: {
    minimumCacheTTL: 31_536_000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      },
    ],
  },
  async redirects() {
    const redirects = await client.fetch(queryRedirects);
    return redirects.map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: redirect.permanent ?? false,
    }));
  },
};

export default nextConfig;
