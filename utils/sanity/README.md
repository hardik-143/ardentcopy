# @/utils/sanity

Shared Sanity CMS utilities, including client configuration, GROQ queries, and image processing.

## Usage

```typescript
// Client and image URL builder
import { client, urlFor } from "@/utils/sanity/client";

// GROQ queries
import { queryHomePageData, queryBlogPaths } from "@/utils/sanity/query";

// Live preview and data fetching
import { sanityFetch, SanityLive } from "@/utils/sanity/live";

// Image processing utilities
import { processImageData, SANITY_BASE_URL } from "@/utils/sanity/image";

// Generated TypeScript types
import type { QueryHomePageDataResult } from "@/utils/sanity/sanity.types";
```

## Exports

| Export     | Description                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `./client` | Sanity client instance and `urlFor` image URL builder                       |
| `./query`  | All GROQ query definitions                                                  |
| `./live`   | `sanityFetch` for data fetching and `SanityLive` component for live preview |
| `./image`  | Image processing utilities and `SANITY_BASE_URL` constant                   |
| `./types`  | Auto-generated TypeScript types from Sanity schemas                         |

## Features

- Pre-configured Sanity client with stega support for visual editing
- Type-safe GROQ queries with TypeGen integration
- Live preview support via `next-sanity`
- Image processing with hotspot and crop support
