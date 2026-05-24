/**
 * Creates a reusable Residential Zip Code Set from the source calculator config,
 * updates the default Residential Calculator to match that config, and migrates
 * legacy inline zipCodes arrays to the new referenced zipCodeConfig field.
 *
 * Run from the studio app:
 *   pnpm exec sanity exec scripts/migrate-residential-calculator-config.ts --with-user-token
 *
 * Run from repo root:
 *   pnpm exec sanity exec studio/scripts/migrate-residential-calculator-config.ts --with-user-token
 */
import { createHash } from "node:crypto";

import { getCliClient } from "sanity/cli";

import {
  RESIDENTIAL_DEFAULT_ZIP_SET_ID,
  createResidentialDefaultCalculatorDocument,
  createResidentialDefaultZipCodes,
  createResidentialZipSetDocument,
  serializeResidentialZipCodes,
  type ResidentialZipCodeInput,
} from "./lib/residential-calculator-config";

type ResidentialCalculatorMigrationDoc = {
  _id: string;
  internalName?: string;
  title?: string;
  zipCodeConfig?: { _ref?: string } | null;
  zipCodes?: ResidentialZipCodeInput[] | null;
};

const client = getCliClient();

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!PROJECT_ID) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Aborting.",
  );
  process.exit(1);
}

console.log(`Migrating ${PROJECT_ID} / ${DATASET}…`);

const defaultZipSignature = serializeResidentialZipCodes(
  createResidentialDefaultZipCodes(),
);

function buildZipSetId(zipCodes: ResidentialZipCodeInput[]) {
  if (serializeResidentialZipCodes(zipCodes) === defaultZipSignature) {
    return RESIDENTIAL_DEFAULT_ZIP_SET_ID;
  }

  const digest = createHash("sha1")
    .update(serializeResidentialZipCodes(zipCodes))
    .digest("hex")
    .slice(0, 12);

  return `residentialZipCodeSet-${digest}`;
}

function buildZipSetName(doc: ResidentialCalculatorMigrationDoc) {
  const base = doc.internalName?.trim() || doc.title?.trim() || doc._id;
  return `${base} Zip Code Set`;
}

async function run() {
  const defaultZipSet = createResidentialZipSetDocument();
  const defaultCalculator = createResidentialDefaultCalculatorDocument();

  await client.createOrReplace(defaultZipSet as never);
  await client.createOrReplace(defaultCalculator as never);
  console.log(
    `Upserted ${defaultZipSet._id} and ${defaultCalculator._id} from the source config.`,
  );

  const docs = await client.fetch<ResidentialCalculatorMigrationDoc[]>(
    `*[_type == "residentialCalculator"]{
      _id,
      internalName,
      title,
      zipCodeConfig,
      zipCodes[]{
        _key,
        label,
        zipStart,
        zipEnd,
        minimumCharge,
        isActive
      }
    }`,
  );

  const createdZipSetIds = new Set<string>([defaultZipSet._id]);

  for (const doc of docs) {
    if (doc.zipCodeConfig?._ref) {
      if (doc.zipCodes && doc.zipCodes.length > 0) {
        await client.patch(doc._id).unset(["zipCodes"]).commit();
        console.log(`Removed legacy inline zipCodes from ${doc._id}.`);
      }
      continue;
    }

    const zipCodes = doc.zipCodes ?? [];
    if (zipCodes.length === 0) {
      await client
        .patch(doc._id)
        .set({
          zipCodeConfig: {
            _type: "reference",
            _ref: RESIDENTIAL_DEFAULT_ZIP_SET_ID,
          },
        })
        .commit();
      console.log(`Assigned default zip-code set to ${doc._id}.`);
      continue;
    }

    const zipSetId = buildZipSetId(zipCodes);
    if (!createdZipSetIds.has(zipSetId)) {
      await client.createIfNotExists(
        createResidentialZipSetDocument({
          id: zipSetId,
          internalName: buildZipSetName(doc),
          zipCodes,
        }) as never,
      );
      createdZipSetIds.add(zipSetId);
      console.log(`Created ${zipSetId} for ${doc._id}.`);
    }

    await client
      .patch(doc._id)
      .set({
        zipCodeConfig: {
          _type: "reference",
          _ref: zipSetId,
        },
      })
      .unset(["zipCodes"])
      .commit();

    console.log(`Migrated ${doc._id} to reference ${zipSetId}.`);
  }

  console.log("Residential calculator migration complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
