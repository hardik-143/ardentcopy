export type ResidentialZipRange = readonly [number, number, number];

export type ResidentialZipCodeInput = {
  _key?: string;
  label?: string | null;
  zipStart: number;
  zipEnd: number;
  minimumCharge: number;
  isActive?: boolean | null;
};

export const RESIDENTIAL_DEFAULT_CALCULATOR_ID =
  "residentialCalculator-default";
export const RESIDENTIAL_DEFAULT_ZIP_SET_ID = "residentialZipCodeSet-default";

export const RESIDENTIAL_DEFAULT_INTERNAL_NAME =
  "Default Residential Calculator";
export const RESIDENTIAL_DEFAULT_ZIP_SET_NAME =
  "Default Residential Service Area";

export const RESIDENTIAL_DEFAULT_TITLE =
  "Calculator for Residential Carpet Cleaning";
export const RESIDENTIAL_DEFAULT_DISCLAIMER_TEXT =
  "Disclaimer: Carpet cleaning is priced by square foot, and several variables are involved, including carpet density, soiling, pet issues, etc. This calculator uses a per room average to provide a rough quote. This quote is intended to give you a 'ballpark' range and is not an actual estimate. We must measure and assess the carpet to determine the exact cost. For an accurate estimate, schedule an on-site consultation.";
export const RESIDENTIAL_DEFAULT_QUOTE_RESULTS_NOTE =
  "An averaged square footage was used to make the calculations. Your service will likely fall between the Lower and Higher ranges listed, but prices vary. This quote is intended for informational purposes only and is not an actual estimate for our services.";

export const RESIDENTIAL_DEFAULT_CLEANING_RATES = {
  perRoomAvg: 84,
  perRoomLow: 52.5,
  perRoomHigh: 122.5,
  perSmallHallAvg: 48,
  perSmallHallLow: 40,
  perSmallHallHigh: 56,
  perLargeHallAvg: 96,
  perLargeHallLow: 80,
  perLargeHallHigh: 112,
  perStepAvg: 7,
  perStepLow: 6.3,
  perStepHigh: 7.35,
};

export const RESIDENTIAL_DEFAULT_AREA_AVERAGES = {
  roomTotalSqFt: 200,
  roomTrafficSqFt: 175,
  smallHallSqFt: 100,
  largeHallSqFt: 200,
};

export const RESIDENTIAL_DEFAULT_PRICE_PER_COLOR_STAIN = 25;

export const RESIDENTIAL_ZIP_RANGES: ResidentialZipRange[] = [
  [95602, 95602, 425],
  [95603, 95603, 375],
  [95605, 95605, 250],
  [95608, 95608, 250],
  [95610, 95610, 300],
  [95612, 95612, 325],
  [95614, 95614, 425],
  [95615, 95615, 350],
  [95616, 95616, 325],
  [95618, 95618, 325],
  [95619, 95619, 425],
  [95620, 95620, 375],
  [95621, 95621, 300],
  [95623, 95623, 425],
  [95624, 95624, 275],
  [95626, 95626, 300],
  [95628, 95628, 300],
  [95629, 95629, 425],
  [95630, 95630, 325],
  [95632, 95632, 350],
  [95638, 95638, 400],
  [95639, 95639, 325],
  [95645, 95645, 425],
  [95648, 95648, 375],
  [95650, 95650, 350],
  [95651, 95651, 425],
  [95652, 95652, 275],
  [95653, 95653, 425],
  [95655, 95655, 275],
  [95658, 95658, 375],
  [95660, 95660, 275],
  [95661, 95662, 300],
  [95663, 95663, 350],
  [95664, 95664, 400],
  [95667, 95667, 425],
  [95668, 95668, 350],
  [95670, 95670, 275],
  [95671, 95671, 325],
  [95672, 95672, 375],
  [95673, 95673, 275],
  [95677, 95678, 325],
  [95680, 95680, 400],
  [95681, 95681, 425],
  [95682, 95682, 400],
  [95683, 95683, 325],
  [95690, 95690, 375],
  [95691, 95691, 250],
  [95693, 95693, 325],
  [95694, 95695, 400],
  [95703, 95703, 425],
  [95722, 95722, 425],
  [95742, 95742, 300],
  [95746, 95746, 325],
  [95747, 95747, 350],
  [95757, 95757, 325],
  [95758, 95758, 300],
  [95762, 95762, 325],
  [95765, 95765, 350],
  [95776, 95776, 375],
  [95811, 95811, 225],
  [95814, 95814, 225],
  [95815, 95815, 250],
  [95816, 95820, 225],
  [95821, 95822, 250],
  [95823, 95823, 275],
  [95824, 95826, 225],
  [95827, 95829, 250],
  [95830, 95832, 275],
  [95833, 95834, 250],
  [95835, 95836, 275],
  [95837, 95837, 300],
  [95838, 95838, 275],
  [95841, 95842, 275],
  [95843, 95843, 300],
  [95864, 95864, 225],
];

export const RESIDENTIAL_DEFAULT_FURNITURE_TIERS = [
  {
    _key: "tier-none",
    _type: "furnitureTier",
    label: "None",
    rateAvg: 0,
    rateLow: 0,
    rateHigh: 0,
    isNone: true,
  },
  {
    _key: "tier-light",
    _type: "furnitureTier",
    label: "Light (1–2 medium or 1 large item) each room",
    rateAvg: 24,
    rateLow: 18,
    rateHigh: 30,
    isNone: false,
  },
  {
    _key: "tier-moderate",
    _type: "furnitureTier",
    label: "Moderate (3 medium or 2 large pieces) each room",
    rateAvg: 48,
    rateLow: 36,
    rateHigh: 60,
    isNone: false,
  },
  {
    _key: "tier-heavy",
    _type: "furnitureTier",
    label: "Heavy (4 medium or 3 large pieces) each room",
    rateAvg: 72,
    rateLow: 54,
    rateHigh: 90,
    isNone: false,
  },
  {
    _key: "tier-everything",
    _type: "furnitureTier",
    label: "Everything (all within reason) each room",
    rateAvg: 108,
    rateLow: 79.5,
    rateHigh: 137.5,
    isNone: false,
  },
] as const;

export const RESIDENTIAL_DEFAULT_TREATMENT_ADDONS = [
  {
    _key: "treatment-heavy",
    _type: "treatmentAddon",
    key: "heavy",
    label: "Heavy or Deep Cleaning",
    description: "Mechanical agitation with CRB or rotary extraction",
    multiplier: 0.375,
    isActive: true,
  },
  {
    _key: "treatment-urine",
    _type: "treatmentAddon",
    key: "urine",
    label: "Pet Urine Treatment",
    description: "Topical treatments or subsurface extraction for urine",
    multiplier: 0.5,
    isActive: true,
  },
  {
    _key: "treatment-dander",
    _type: "treatmentAddon",
    key: "dander",
    label: "Pet Dander Removal",
    description: 'Pet dander odor (the "wet dog" smell)',
    multiplier: 0.625,
    bundledMultiplier: 0.25,
    isActive: true,
  },
  {
    _key: "treatment-protect",
    _type: "treatmentAddon",
    key: "protect",
    label: "Apply Protectant",
    description:
      "California has banned fluorochemicals — an approved alternative will be used.",
    multiplier: 0.3125,
    isActive: true,
  },
] as const;

export const RESIDENTIAL_DEFAULT_OIL_SPOT_BRACKETS = [
  {
    _key: "oil-0",
    _type: "oilSpotBracket",
    label: "None",
    flatPrice: 0,
  },
  {
    _key: "oil-1",
    _type: "oilSpotBracket",
    label: '1–5 small ("finger-tip") or 1 large ("quarter")',
    flatPrice: 15,
  },
  {
    _key: "oil-2",
    _type: "oilSpotBracket",
    label: "6–10 small or 2 large",
    flatPrice: 30,
  },
  {
    _key: "oil-3",
    _type: "oilSpotBracket",
    label: "11–15 small or 3 large",
    flatPrice: 45,
  },
  {
    _key: "oil-4",
    _type: "oilSpotBracket",
    label: "16–20 small or 4 large",
    flatPrice: 60,
  },
  {
    _key: "oil-5",
    _type: "oilSpotBracket",
    label: "21–25 small or 5 large",
    flatPrice: 75,
  },
  {
    _key: "oil-6",
    _type: "oilSpotBracket",
    label: "26–30 small or 6 large",
    flatPrice: 90,
  },
  {
    _key: "oil-7",
    _type: "oilSpotBracket",
    label: "30+ small or multiple large",
    flatPrice: 120,
  },
] as const;

export function createZipCodeKey(zipStart: number, zipEnd: number) {
  return `zip-${zipStart}-${zipEnd}`;
}

export function normalizeResidentialZipCodes(
  zipCodes: ResidentialZipCodeInput[],
) {
  return [...zipCodes]
    .map((zip) => ({
      _key: zip._key ?? createZipCodeKey(zip.zipStart, zip.zipEnd),
      _type: "serviceZipCode" as const,
      ...(zip.label ? { label: zip.label } : {}),
      zipStart: zip.zipStart,
      zipEnd: zip.zipEnd,
      minimumCharge: zip.minimumCharge,
      isActive: zip.isActive ?? true,
    }))
    .sort(
      (left, right) =>
        left.zipStart - right.zipStart ||
        left.zipEnd - right.zipEnd ||
        left.minimumCharge - right.minimumCharge,
    );
}

export function createResidentialDefaultZipCodes() {
  return normalizeResidentialZipCodes(
    RESIDENTIAL_ZIP_RANGES.map(([zipStart, zipEnd, minimumCharge]) => ({
      zipStart,
      zipEnd,
      minimumCharge,
      isActive: true,
    })),
  );
}

export function serializeResidentialZipCodes(
  zipCodes: ResidentialZipCodeInput[],
) {
  return JSON.stringify(
    normalizeResidentialZipCodes(zipCodes).map(
      ({ label, zipStart, zipEnd, minimumCharge, isActive }) => ({
        label: label ?? null,
        zipStart,
        zipEnd,
        minimumCharge,
        isActive: isActive ?? true,
      }),
    ),
  );
}

export function createResidentialZipSetDocument({
  id = RESIDENTIAL_DEFAULT_ZIP_SET_ID,
  internalName = RESIDENTIAL_DEFAULT_ZIP_SET_NAME,
  zipCodes = createResidentialDefaultZipCodes(),
}: {
  id?: string;
  internalName?: string;
  zipCodes?: ResidentialZipCodeInput[];
} = {}) {
  return {
    _id: id,
    _type: "residentialZipCodeSet",
    internalName,
    zipCodes: normalizeResidentialZipCodes(zipCodes),
  };
}

export function createResidentialDefaultCalculatorDocument() {
  return {
    _id: RESIDENTIAL_DEFAULT_CALCULATOR_ID,
    _type: "residentialCalculator",
    internalName: RESIDENTIAL_DEFAULT_INTERNAL_NAME,
    title: RESIDENTIAL_DEFAULT_TITLE,
    disclaimerText: RESIDENTIAL_DEFAULT_DISCLAIMER_TEXT,
    quoteResultsNote: RESIDENTIAL_DEFAULT_QUOTE_RESULTS_NOTE,
    cleaningRates: RESIDENTIAL_DEFAULT_CLEANING_RATES,
    areaAverages: RESIDENTIAL_DEFAULT_AREA_AVERAGES,
    pricePerColorStain: RESIDENTIAL_DEFAULT_PRICE_PER_COLOR_STAIN,
    zipCodeConfig: {
      _type: "reference",
      _ref: RESIDENTIAL_DEFAULT_ZIP_SET_ID,
    },
    furnitureTiers: RESIDENTIAL_DEFAULT_FURNITURE_TIERS,
    treatmentAddons: RESIDENTIAL_DEFAULT_TREATMENT_ADDONS,
    oilSpotBrackets: RESIDENTIAL_DEFAULT_OIL_SPOT_BRACKETS,
  };
}
