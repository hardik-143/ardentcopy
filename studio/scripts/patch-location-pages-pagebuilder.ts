/**
 * Patches the 9 new location page drafts with the full pageBuilder from Atlanta.
 * Run from repo root: pnpm exec sanity exec studio/scripts/patch-location-pages-pagebuilder.ts --with-user-token --project=4uxdyxv3 --dataset=production
 * Or from studio: pnpm exec sanity exec scripts/patch-location-pages-pagebuilder.ts --with-user-token
 *
 * Requires SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET (or pass --project and --dataset).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const DRAFT_IDS = [
  "drafts.3a498d87-01b5-4d9a-a5fd-024a421f6aeb",
  "drafts.26c13c1e-4c57-47c0-9eb7-e1af1ad2668e",
  "drafts.4cc7ced1-113a-432e-945a-340329f5d18c",
  "drafts.e088b213-dd5a-48a3-b4d3-8a5035eb17af",
  "drafts.b1d7da8c-16bf-477a-917e-dadd1af0b734",
  "drafts.215d8428-61f6-463b-b471-2978cab70f55",
  "drafts.b820e9a3-bb1f-43c2-85e2-a858362a608d",
  "drafts.ac59adef-2e18-400d-9d8f-221f5ba1a3e5",
  "drafts.973da9fc-4e8c-4063-b24e-3bfff5b3cfe8",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..", "..");
const pageBuilderPath = join(repoRoot, "temp-atlanta-pagebuilder.json");

async function run() {
  const raw = readFileSync(pageBuilderPath, "utf8");
  const pageBuilder = JSON.parse(raw) as unknown[];

  for (const draftId of DRAFT_IDS) {
    try {
      await client.patch(draftId).set({ pageBuilder }).commit();
      console.log(`Patched ${draftId}`);
    } catch (err) {
      console.error(`Failed to patch ${draftId}:`, err);
    }
  }
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
