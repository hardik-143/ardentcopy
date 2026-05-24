/**
 * Migrates pageBuilder blocks from twoColumnBlock to splitContent.
 * Run from studio: pnpm exec sanity exec scripts/migrate-two-column-to-split-content.ts --with-user-token
 *
 * Requires SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET (or default "production").
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const DATASET = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!PROJECT_ID) {
  console.error("Missing SANITY_STUDIO_PROJECT_ID");
  process.exit(1);
}

async function migrate() {
  const query = `*[_type in ["homePage", "page", "blogIndex", "blog"] && defined(pageBuilder) && count(pageBuilder[_type == "twoColumnBlock"]) > 0]{ _id, _type, "blocks": pageBuilder[_type == "twoColumnBlock"]{ _key, _type } }`;
  const docs = await client.fetch<
    Array<{ _id: string; _type: string; blocks: Array<{ _key: string; _type: string }> }>
  >(query);

  if (docs.length === 0) {
    console.log("No documents with twoColumnBlock found.");
    return;
  }

  console.log(
    `Found ${docs.length} document(s) with twoColumnBlock. Migrating to splitContent...`
  );

  for (const doc of docs) {
    const docId = doc._id;
    for (const block of doc.blocks) {
      const path = `pageBuilder[_key=="${block._key}"]._type`;
      try {
        await client.patch(docId).set({ [path]: "splitContent" }).commit();
        console.log(`  ${docId}: twoColumnBlock (${block._key}) -> splitContent`);
      } catch (err) {
        console.error(`  ${docId}: failed to patch ${block._key}:`, err);
      }
    }
  }

  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
