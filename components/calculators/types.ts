export type CommercialAddon = {
  _key?: string | null;
  title: string | null;
  description: string | null;
  rateAddition: number | null;
  isActive?: boolean | null;
};

export type CommercialFurnishing = {
  _key?: string | null;
  label: string | null;
  multiplier: number | null;
  isDefault: boolean | null;
};

export type CommercialBuildingType = {
  _key?: string | null;
  label: string | null;
  isActive?: boolean | null;
};

export type CommercialPricing = {
  baseRate: number | null;
  minDay: number | null;
  minAH1: number | null;
  minAH2: number | null;
  floorAH1: number | null;
  floorAH2: number | null;
  rangeVariance: number | null;
};

export type CommercialCalculatorDoc = {
  _id?: string;
  title: string | null;
  introText: string | null;
  quoteNote: string | null;
  pricing: CommercialPricing | null;
  addons: CommercialAddon[] | null;
  furnishings: CommercialFurnishing[] | null;
  buildingTypes: CommercialBuildingType[] | null;
};

export type ServiceZipCode = {
  _key?: string | null;
  label?: string | null;
  zipStart: number;
  zipEnd: number;
  minimumCharge: number;
  isActive?: boolean | null;
};

export type FurnitureTier = {
  _key?: string | null;
  label: string;
  rateAvg: number;
  rateLow: number;
  rateHigh: number;
  isNone: boolean | null;
};

export type TreatmentAddon = {
  _key?: string | null;
  key: "heavy" | "urine" | "dander" | "protect" | string;
  label: string;
  description: string | null;
  multiplier: number;
  bundledMultiplier: number | null;
  isActive?: boolean | null;
};

export type OilSpotBracket = {
  _key?: string | null;
  label: string;
  flatPrice: number;
};

export type ResidentialCleaningRates = {
  perRoomAvg: number;
  perRoomLow: number;
  perRoomHigh: number;
  perSmallHallAvg: number;
  perSmallHallLow: number;
  perSmallHallHigh: number;
  perLargeHallAvg: number;
  perLargeHallLow: number;
  perLargeHallHigh: number;
  perStepAvg: number;
  perStepLow: number;
  perStepHigh: number;
};

export type ResidentialAreaAverages = {
  roomTotalSqFt: number;
  roomTrafficSqFt: number;
  smallHallSqFt: number;
  largeHallSqFt: number;
};

export type ResidentialCalculatorDoc = {
  _id?: string;
  title: string | null;
  disclaimerText: string | null;
  quoteResultsNote: string | null;
  cleaningRates: ResidentialCleaningRates | null;
  areaAverages: ResidentialAreaAverages | null;
  pricePerColorStain: number | null;
  zipCodes: ServiceZipCode[] | null;
  furnitureTiers: FurnitureTier[] | null;
  treatmentAddons: TreatmentAddon[] | null;
  oilSpotBrackets: OilSpotBracket[] | null;
};
