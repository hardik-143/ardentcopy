import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineCliConfig } from "sanity/cli";
import tsconfigPaths from "vite-plugin-tsconfig-paths";

import { Logger } from "../utils/logger";

loadEnv({ path: path.resolve(__dirname, "../.env") });
loadEnv({ path: path.resolve(__dirname, "../.env.local"), override: true });

const logger = new Logger("SanityCLI");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-08-29";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const studioTitle =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_TITLE ?? "Studio";

if (!projectId) {
  logger.warn(
    "Missing or invalid NEXT_PUBLIC_SANITY_PROJECT_ID - some features may not work"
  );
}
if (!dataset) {
  logger.warn(
    "Missing or invalid NEXT_PUBLIC_SANITY_DATASET - some features may not work"
  );
}

const studioHost = projectId || undefined;

if (studioHost) {
  logger.info(`Sanity Studio Host: https://${studioHost}.sanity.studio`);
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost,
  deployment: {
    autoUpdates: false,
  },
  vite: {
    plugins: [tsconfigPaths()],
    define: {
      "process.env.NEXT_PUBLIC_BASE_URL": JSON.stringify(baseUrl),
      "process.env.NEXT_PUBLIC_SANITY_API_VERSION": JSON.stringify(apiVersion),
      "process.env.NEXT_PUBLIC_SANITY_DATASET": JSON.stringify(dataset),
      "process.env.NEXT_PUBLIC_SANITY_PROJECT_ID": JSON.stringify(projectId),
      "process.env.NEXT_PUBLIC_SANITY_STUDIO_TITLE": JSON.stringify(studioTitle),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, ".."),
        "@studio": path.resolve(__dirname, "."),
      },
    },
  },
});
