/**
 * Migrates pageBuilder blocks from old hero/hero2 _type to heroPrimary/heroSecondary.
 * Run from studio: pnpm exec sanity exec scripts/migrate-hero-blocks.ts --with-user-token
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET (or default "production").
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!PROJECT_ID) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  process.exit(1);
}

async function migrate() {
  const query = `*[_type in ["homePage", "page", "blogIndex", "blog"] && defined(pageBuilder) && count(pageBuilder[_type in ["hero", "hero2"]]) > 0]{ _id, _type, "blocks": pageBuilder[_type in ["hero", "hero2"]]{ _key, _type } }`;
  const docs = await client.fetch<Array<{ _id: string; _type: string; blocks: Array<{ _key: string; _type: string }> }>>(query);

  if (docs.length === 0) {
    console.log("No documents with hero/hero2 blocks found.");
    return;
  }

  console.log(`Found ${docs.length} document(s) with hero/hero2 blocks. Migrating...`);

  for (const doc of docs) {
    const docId = doc._id;
    for (const block of doc.blocks) {
      const newType = block._type === "hero" ? "heroPrimary" : "heroSecondary";
      const path = `pageBuilder[_key=="${block._key}"]._type`;
      try {
        await client.patch(docId).set({ [path]: newType }).commit();
        console.log(`  ${docId}: ${block._type} (${block._key}) -> ${newType}`);
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
