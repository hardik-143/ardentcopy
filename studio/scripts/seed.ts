/**
 * Seeds the Sanity dataset with one default Commercial Calculator and one
 * default Residential Calculator document. The residential calculator now
 * references a reusable Residential Zip Code Set document so multiple
 * calculators can share the same service area configuration.
 *
 * Run from the studio app:
 *   pnpm exec sanity exec scripts/seed.ts --with-user-token
 *
 * Idempotent: deterministic _ids written with createOrReplace.
 *
 * Reads NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET.
 */
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

import {
  createResidentialDefaultCalculatorDocument,
  createResidentialZipSetDocument,
} from "./lib/residential-calculator-config";

const client = getCliClient();

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!PROJECT_ID) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Aborting."
  );
  process.exit(1);
}

console.log(`Seeding ${PROJECT_ID} / ${DATASET}…`);

const k = (suffix: string) => `${suffix}-${randomUUID().slice(0, 8)}`;

/* ---------- Commercial ---------- */

const commercial = {
  _id: "commercialCalculator-default",
  _type: "commercialCalculator",
  internalName: "Default Commercial Calculator",
  title: "Commercial Carpet Cleaning Quote Calculater",
  introText:
    "This calculater will help us give you a rough quote by selecting the approximate square footage (to the nearest 100 is okay) and asking a few related questions about the cleaning.",
  quoteNote:
    'This is a rough quote for the square footage inputted, along with a lower and upper range, representing 20% less or 20% more area for cleaning, respectively. This quote is a "ballpark" figure for informational purposes only. We\'ll need to assess and measure the carpet to provide you with an accurate estimate. Please note that our cleaning rates include dry vacuuming before the wet cleaning.',
  pricing: {
    baseRate: 0.32,
    minDay: 300,
    minAH1: 450,
    minAH2: 600,
    floorAH1: 0.48,
    floorAH2: 0.64,
    rangeVariance: 0.2,
  },
  addons: [
    {
      _key: k("heavy"),
      _type: "commercialAddonOption",
      title: "Heavy Cleaning",
      description: "Mechanical agitation with CRB or rotary extraction",
      rateAddition: 0.12,
      isActive: true,
    },
    {
      _key: k("grease"),
      _type: "commercialAddonOption",
      title: "Heavy Grease or Oil",
      description: "Heavy grease or oil removal (i.e. restaurants, auto service)",
      rateAddition: 0.18,
      isActive: true,
    },
    {
      _key: k("deo"),
      _type: "commercialAddonOption",
      title: "Deodorize",
      description: "Treatments for odors such as mildew, pet, or other",
      rateAddition: 0.16,
      isActive: true,
    },
  ],
  furnishings: [
    {
      _key: k("furn-some"),
      _type: "commercialFurnishingOption",
      label: "Some furnishings (i.e. a few desk, chairs, cabinets)",
      multiplier: 0.875,
      isDefault: true,
    },
    {
      _key: k("furn-cubicles"),
      _type: "commercialFurnishingOption",
      label: "Numerous cubicles w/desks, chairs, etc... (i.e. office building)",
      multiplier: 1,
      isDefault: false,
    },
    {
      _key: k("furn-restaurant"),
      _type: "commercialFurnishingOption",
      label: "Tables, chairs & booths (i.e. restaurant)",
      multiplier: 1,
      isDefault: false,
    },
    {
      _key: k("furn-vacant"),
      _type: "commercialFurnishingOption",
      label: "Vacant or mostly empty/open spaces",
      multiplier: 0.875,
      isDefault: false,
    },
  ],
  buildingTypes: [
    "Store/Retail",
    "Office/Government Building",
    "Small Office(s)/Reception",
    "Church/School/Classrooms",
    "Restaurant",
    "Other (not listed)",
  ].map((label) => ({
    _key: k("bldg"),
    _type: "commercialBuildingType",
    label,
    isActive: true,
  })),
};

/* ---------- Residential ---------- */

const residentialZipCodeSet = createResidentialZipSetDocument();
const residential = createResidentialDefaultCalculatorDocument();

/* ---------- Run ---------- */

async function run() {
  const tx = client.transaction();
  tx.createOrReplace(commercial as never);
  tx.createOrReplace(residentialZipCodeSet as never);
  tx.createOrReplace(residential as never);
  await tx.commit();
  console.log(
    "Seeded 3 documents (1 commercial, 1 residential zip-code set, 1 residential calculator).",
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
