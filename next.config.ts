import "./utils/env/client";
import "./utils/env/server";

import type { NextConfig } from "next";

import { env } from "./utils/env/client";
import { client } from "./utils/sanity/client";
import { queryRedirects } from "./utils/sanity/query";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
