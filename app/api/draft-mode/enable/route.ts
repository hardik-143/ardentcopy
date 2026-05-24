/**
 * Allows Sanity Presentation to enable Next.js Draft Mode so that the site
 * iframe renders draft content with Visual Editing overlays.
 *
 * Reference: https://www.sanity.io/docs/visual-editing/visual-editing-with-nextjs-app-router
 */
import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { env } from "@/utils/env/server";
import { client } from "@/utils/sanity/client";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: env.SANITY_API_READ_TOKEN }),
});
