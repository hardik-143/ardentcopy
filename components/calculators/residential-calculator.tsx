"use client";

import { useEffect, useMemo, useState } from "react";

import "./residential-calculator.css";
import type {
  FurnitureTier,
  OilSpotBracket,
  ResidentialAreaAverages,
  ResidentialCalculatorDoc,
  ResidentialCleaningRates,
  ServiceZipCode,
  TreatmentAddon,
} from "./types";

const DEFAULT_RATES: ResidentialCleaningRates = {
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

const DEFAULT_AREAS: ResidentialAreaAverages = {
  roomTotalSqFt: 200,
  roomTrafficSqFt: 175,
  smallHallSqFt: 100,
  largeHallSqFt: 200,
};

// Fallback furniture tiers — used when no Sanity document is configured
const DEFAULT_FURNITURE_TIERS: FurnitureTier[] = [
  {
    _key: "t-none",
    label: "None",
    rateAvg: 0,
    rateLow: 0,
    rateHigh: 0,
    isNone: true,
  },
  {
    _key: "t-light",
    label: "Light (1–2 medium or 1 large item) each room",
    rateAvg: 24,
    rateLow: 18,
    rateHigh: 30,
    isNone: false,
  },
  {
    _key: "t-moderate",
    label: "Moderate (3 medium or 2 large pieces) each room",
    rateAvg: 48,
    rateLow: 36,
    rateHigh: 60,
    isNone: false,
  },
  {
    _key: "t-heavy",
    label: "Heavy (4 medium or 3 large pieces) each room",
    rateAvg: 72,
    rateLow: 54,
    rateHigh: 90,
    isNone: false,
  },
  {
    _key: "t-everything",
    label: "Everything (all within reason) each room",
    rateAvg: 108,
    rateLow: 79.5,
    rateHigh: 137.5,
    isNone: false,
  },
];

// Fallback treatment add-ons — exact multipliers from the original Calconic config
const DEFAULT_TREATMENT_ADDONS: TreatmentAddon[] = [
  {
    _key: "tr-heavy",
    key: "heavy",
    label: "Heavy or Deep Cleaning",
    description: "Mechanical agitation with CRB or rotary extraction",
    multiplier: 0.375,
    bundledMultiplier: null,
    isActive: true,
  },
  {
    _key: "tr-urine",
    key: "urine",
    label: "Pet Urine Treatment",
    description: "Topical treatments or subsurface extraction for urine",
    multiplier: 0.5,
    bundledMultiplier: null,
    isActive: true,
  },
  {
    _key: "tr-dander",
    key: "dander",
    label: "Pet Dander Removal",
    description: 'Pet dander odor (the "wet dog" smell)',
    multiplier: 0.625,
    bundledMultiplier: 0.25,
    isActive: true,
  },
  {
    _key: "tr-protect",
    key: "protect",
    label: "Apply Protectant",
    description:
      "California has banned fluorochemicals — an approved alternative will be used.",
    multiplier: 0.3125,
    bundledMultiplier: null,
    isActive: true,
  },
];

// Fallback oil/grease spot brackets
const DEFAULT_OIL_BRACKETS: OilSpotBracket[] = [
  { _key: "o-0", label: "None", flatPrice: 0 },
  {
    _key: "o-1",
    label: '1–5 small ("finger-tip") or 1 large ("quarter") spot',
    flatPrice: 15,
  },
  { _key: "o-2", label: "6–10 small or 2 large", flatPrice: 30 },
  { _key: "o-3", label: "11–15 small or 3 large", flatPrice: 45 },
  { _key: "o-4", label: "16–20 small or 4 large", flatPrice: 60 },
  { _key: "o-5", label: "21–25 small or 5 large", flatPrice: 75 },
  { _key: "o-6", label: "26–30 small or 6 large", flatPrice: 90 },
  { _key: "o-7", label: "30+ small spots or multiple large", flatPrice: 120 },
];

/**
 * Treatment multipliers should be small decimals (0.375, 0.5, etc.).
 * If entered as percentages (37.5) or whole numbers (375), normalise back.
 */
function normalizeTreatmentMult(m: number): number {
  if (!m || m <= 0) return 0;
  if (m <= 5) return m; // 0.375, 0.5, 0.625 — already correct
  if (m <= 100) return m / 100; // 37.5 → 0.375, 50 → 0.5
  return m / 1000; // 375  → 0.375
}

const DEFAULT_ZIP_INPUT = 12345;

const STEP_LABELS = [
  "",
  "Jobsite Location",
  "Jobsite Details",
  "Furniture Movement",
  "Additional Treatments and Protocols",
  "Quote Results",
];

type ZipLookup =
  | { state: "default"; min: 0 }
  | { state: "in-area"; min: number }
  | { state: "out-of-area"; min: 0 };

function lookupZip(zip: number, ranges: ServiceZipCode[]): ZipLookup {
  if (zip === DEFAULT_ZIP_INPUT) return { state: "default", min: 0 };
  for (const r of ranges) {
    if (r.isActive === false) continue;
    if (zip >= r.zipStart && zip <= r.zipEnd) {
      return { state: "in-area", min: r.minimumCharge };
    }
  }
  return { state: "out-of-area", min: 0 };
}

type Calc = {
  rooms: number;
  smallHall: number;
  largeHall: number;
  steps: number;
  furnMove: number;
  furnRooms: number;
  tier: FurnitureTier | null;
  treatments: Record<string, boolean>;
  oilSpotPrice: number;
  colorStains: number;
  zipMin: number;
  rates: ResidentialCleaningRates;
  areas: ResidentialAreaAverages;
  treatmentDefs: TreatmentAddon[];
  pricePerColorStain: number;
};

function computeQuote(s: Calc) {
  const r = s.rates;
  const c_avg =
    s.rooms * r.perRoomAvg +
    s.smallHall * r.perSmallHallAvg +
    s.largeHall * r.perLargeHallAvg +
    s.steps * r.perStepAvg;
  const c_low =
    s.rooms * r.perRoomLow +
    s.smallHall * r.perSmallHallLow +
    s.largeHall * r.perLargeHallLow +
    s.steps * r.perStepLow;
  const c_high =
    s.rooms * r.perRoomHigh +
    s.smallHall * r.perSmallHallHigh +
    s.largeHall * r.perLargeHallHigh +
    s.steps * r.perStepHigh;

  const fr = s.furnMove === 1 ? s.furnRooms : 0;
  const f_avg = s.tier ? s.tier.rateAvg * fr : 0;
  const f_low = s.tier ? s.tier.rateLow * fr : 0;
  const f_high = s.tier ? s.tier.rateHigh * fr : 0;

  const heavyOn = Boolean(s.treatments.heavy);
  const treatmentSum = (base: number) =>
    s.treatmentDefs.reduce((sum, t) => {
      if (!s.treatments[t.key]) return sum;
      const rawM =
        heavyOn && t.bundledMultiplier != null && t.key !== "heavy"
          ? t.bundledMultiplier
          : t.multiplier;
      return sum + base * normalizeTreatmentMult(rawM);
    }, 0);

  const a_avg =
    treatmentSum(c_avg) + s.oilSpotPrice + s.colorStains * s.pricePerColorStain;
  const a_low =
    treatmentSum(c_low) + s.oilSpotPrice + s.colorStains * s.pricePerColorStain;
  const a_high =
    treatmentSum(c_high) +
    s.oilSpotPrice +
    s.colorStains * s.pricePerColorStain;

  const avg = Math.max(c_avg + f_avg + a_avg, s.zipMin);
  const lower = Math.max(c_low + f_low + a_low, s.zipMin);
  const higher = Math.max(c_high + f_high + a_high, s.zipMin);

  const totalArea =
    s.rooms * s.areas.roomTotalSqFt +
    s.smallHall * s.areas.smallHallSqFt +
    s.largeHall * s.areas.largeHallSqFt;
  const trafficArea =
    s.rooms * s.areas.roomTrafficSqFt +
    s.smallHall * s.areas.smallHallSqFt +
    s.largeHall * s.areas.largeHallSqFt;

  return { avg, lower, higher, totalArea, trafficArea, hasAreas: c_avg > 0 };
}

export function ResidentialCalculator({
  data,
  title,
  anchorId,
}: {
  data: ResidentialCalculatorDoc | null;
  title?: string | null;
  anchorId?: string | null;
}) {
  // console.log("Calculator data:", data); // Debug log to inspect incoming data
  const rates = (data?.cleaningRates ??
    DEFAULT_RATES) as ResidentialCleaningRates;
  const areas = (data?.areaAverages ??
    DEFAULT_AREAS) as ResidentialAreaAverages;
  const pricePerColorStain = data?.pricePerColorStain ?? 25;

  const tiers = useMemo(() => {
    const raw = data?.furnitureTiers ?? [];
    const source = raw.length > 0 ? raw : DEFAULT_FURNITURE_TIERS;
    return source.filter((t) => t.label);
  }, [data?.furnitureTiers]);

  const treatmentDefs = useMemo(() => {
    const raw = data?.treatmentAddons ?? [];
    const source = raw.length > 0 ? raw : DEFAULT_TREATMENT_ADDONS;
    return source.filter((t) => t.isActive !== false && t.key && t.label);
  }, [data?.treatmentAddons]);

  const oilBrackets = useMemo(() => {
    const raw = data?.oilSpotBrackets ?? [];
    const source = raw.length > 0 ? raw : DEFAULT_OIL_BRACKETS;
    return source.filter((b) => b.label);
  }, [data?.oilSpotBrackets]);

  const zipCodes = useMemo(
    () => (data?.zipCodes ?? []).filter((z) => z.isActive !== false),
    [data?.zipCodes]
  );

  const [step, setStep] = useState(1);
  const [zip, setZip] = useState(DEFAULT_ZIP_INPUT);
  const [rooms, setRooms] = useState(0);
  const [hallToggle, setHallToggle] = useState(false);
  const [smallHall, setSmallHall] = useState(0);
  const [largeHall, setLargeHall] = useState(0);
  const [stairsToggle, setStairsToggle] = useState(false);
  const [steps, setSteps] = useState(0);
  const [furnMove, setFurnMove] = useState(0);
  const [furnRooms, setFurnRooms] = useState(0);
  const [tierKey, setTierKey] = useState<string>(tiers[0]?._key ?? "");
  const [treatments, setTreatments] = useState<Record<string, boolean>>({});
  const [stainsToggle, setStainsToggle] = useState(false);
  const [oilBracketKey, setOilBracketKey] = useState<string>(
    oilBrackets[0]?._key ?? ""
  );
  const [colorStains, setColorStains] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!tierKey && tiers[0]?._key) setTierKey(tiers[0]._key);
  }, [tiers, tierKey]);
  useEffect(() => {
    if (!oilBracketKey && oilBrackets[0]?._key) {
      setOilBracketKey(oilBrackets[0]._key);
    }
  }, [oilBrackets, oilBracketKey]);

  const zipResult = lookupZip(zip, zipCodes);
  const zipOk = zipResult.state === "in-area";

  const tier = tiers.find((t) => t._key === tierKey) ?? null;
  const oilBracket: OilSpotBracket | undefined = oilBrackets.find(
    (b) => b._key === oilBracketKey
  );

  const calcInput: Calc = {
    rooms,
    smallHall: hallToggle ? smallHall : 0,
    largeHall: hallToggle ? largeHall : 0,
    steps: stairsToggle ? steps : 0,
    furnMove,
    furnRooms,
    tier,
    treatments,
    oilSpotPrice: stainsToggle ? (oilBracket?.flatPrice ?? 0) : 0,
    colorStains: stainsToggle ? colorStains : 0,
    zipMin: zipResult.state === "in-area" ? zipResult.min : 0,
    rates,
    areas,
    treatmentDefs,
    pricePerColorStain,
  };
  const q = computeQuote(calcInput);

  const totalSteps = 5;
  const hasFurnitureRooms = furnRooms > 0;

  const goNext = () => setStep((n) => Math.min(totalSteps, n + 1));
  const goBack = () => setStep((n) => Math.max(1, n - 1));

  const zipFeedback = (() => {
    if (zipResult.state === "default") {
      return {
        cls: "validate error",
        text: "Enter a valid zip code to continue",
      };
    }
    if (zipResult.state === "out-of-area") {
      return {
        cls: "validate error",
        text: "The zip code is either invalid or outside our service area. We occasionally go further out when viable — call us.",
      };
    }
    return { cls: "validate success", text: "✓ We service this location!" };
  })();

  return (
    <section
      className="ardent-residential-calc"
      id={anchorId || undefined}
      style={{ padding: "28px 16px 60px" }}
    >
      <div className="calc">
        <div className="title">
          {title || data?.title || "Calculator for Residential Carpet Cleaning"}
        </div>
        <div className="step-header">{STEP_LABELS[step]}</div>

        <div className="wizard">
          {/* STEP 1 */}
          <div className={`step${step === 1 ? " active" : ""}`}>
            <div className="grid grid-3">
              <div>
                <div className="field-title">Where is the job located?</div>
                <div className="field-hint">
                  To begin, enter the 5-digit zip code of the property that
                  needs carpet cleaning service.
                </div>
              </div>
              <div>
                <div className="field-title">
                  Zip Code (service location){" "}
                  <span
                    className="info-dot"
                    title="Enter the 5-digit Zip Code where the service is needed"
                  >
                    i
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={99999}
                  value={zip}
                  onChange={(e) => setZip(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div>
                <div className={zipFeedback.cls}>{zipFeedback.text}</div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`step${step === 2 ? " active" : ""}`}>
            {!zipOk ? (
              <div className="validate error">
                The zip code is either invalid or outside our service area.
                Return to the previous step and enter a different zip code to
                proceed. We consider jobs further out on a case-by-case basis —
                call us.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <div className="field-title">
                    Rooms for Carpet Cleaning{" "}
                    <span
                      className="info-dot"
                      title="Use the slider to select the number of rooms to be cleaned"
                    >
                      i
                    </span>
                  </div>
                  <div className="field-hint">
                    Use the slider to select the number of rooms to be cleaned
                    (living, family, dining, den, bedrooms, loft). Do not count
                    hallways or stairs yet. Combination rooms like a unified
                    living + dining count as two.
                  </div>
                  <div className="slider-row">
                    <div className="slider-head">
                      <span>Number of rooms</span>
                      <span className="val">
                        <span>{rooms}</span> room(s)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12}
                      step={1}
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value, 10))}
                    />
                    <div className="tick-labels">
                      <span>0</span>
                      <span>3</span>
                      <span>6</span>
                      <span>9</span>
                      <span>12</span>
                    </div>
                  </div>
                </div>

                <label
                  className={`check-row${hallToggle ? " selected" : ""}`}
                  style={{ marginBottom: 14 }}
                >
                  <input
                    type="checkbox"
                    checked={hallToggle}
                    onChange={(e) => setHallToggle(e.target.checked)}
                  />
                  <div className="ctxt">
                    <div className="title-txt">
                      Hallways for Carpet Cleaning
                    </div>
                    <div className="sub-txt">
                      Check the box if there are any hallways that need carpet
                      cleaning.
                    </div>
                  </div>
                </label>

                {hallToggle ? (
                  <div style={{ marginBottom: 14 }}>
                    <div className="field-hint">
                      <em>
                        Small hallways are ≤100 sq ft, large are 100–200 sq ft.
                        Enter the number for each.
                      </em>
                    </div>
                    <div className="num-grid">
                      <div className="num-field">
                        <label>Small Hallway(s)</label>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          step={1}
                          value={smallHall}
                          onChange={(e) =>
                            setSmallHall(
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            )
                          }
                        />
                        <div className="hint">
                          Small hallways are 100 sf or less
                        </div>
                      </div>
                      <div className="num-field">
                        <label>Large Hallway(s)</label>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          step={1}
                          value={largeHall}
                          onChange={(e) =>
                            setLargeHall(
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            )
                          }
                        />
                        <div className="hint">
                          Large hallways are 100–200 sf
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <label
                  className={`check-row${stairsToggle ? " selected" : ""}`}
                  style={{ marginBottom: 14 }}
                >
                  <input
                    type="checkbox"
                    checked={stairsToggle}
                    onChange={(e) => setStairsToggle(e.target.checked)}
                  />
                  <div className="ctxt">
                    <div className="title-txt">Stairs for Carpet Cleaning</div>
                    <div className="sub-txt">
                      Check the box if there are any stairs that need carpet
                      cleaning.
                    </div>
                  </div>
                </label>

                {stairsToggle ? (
                  <div>
                    <div className="field-hint">
                      <em>
                        Stairs are priced based on the width of each step. An
                        average staircase has 16–17 steps.
                      </em>
                    </div>
                    <div className="num-field" style={{ maxWidth: 280 }}>
                      <label>Number of Step(s)</label>
                      <input
                        type="number"
                        min={0}
                        max={108}
                        step={1}
                        value={steps}
                        onChange={(e) =>
                          setSteps(
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                      />
                      <div className="hint">
                        An average staircase has 16–17 steps
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div className={`step${step === 3 ? " active" : ""}`}>
            {!zipOk || !q.hasAreas ? (
              <div className="validate error">
                You haven't selected any areas for carpet cleaning. Return to
                the Jobsite Details section to select areas to be cleaned.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div className="field-title">
                    Will we be moving any furniture?{" "}
                    <span
                      className="info-dot"
                      title="Select yes if you'd like us to move and clean underneath any furniture"
                    >
                      i
                    </span>
                  </div>
                  <div className="radio-inline">
                    <label className={furnMove === 1 ? "selected" : ""}>
                      <input
                        type="radio"
                        name="furn-move"
                        checked={furnMove === 1}
                        onChange={() => setFurnMove(1)}
                      />{" "}
                      Yes
                    </label>
                    <label className={furnMove === 0 ? "selected" : ""}>
                      <input
                        type="radio"
                        name="furn-move"
                        checked={furnMove === 0}
                        onChange={() => setFurnMove(0)}
                      />{" "}
                      No
                    </label>
                  </div>
                  <div className="field-hint" style={{ marginTop: 10 }}>
                    We often clean open traffic areas around furniture, but we
                    can move some furniture and clean underneath within reason.
                    Where appropriate, we place Styrofoam blocks or plastic tabs
                    under moved items. Furniture manipulation adds significant
                    labor and affects pricing.
                  </div>
                </div>

                {furnMove === 1 ? (
                  <div
                    className={`num-grid${hasFurnitureRooms ? "" : " single"}`}
                  >
                    <div className="num-field">
                      <label>In how many rooms?</label>
                      <input
                        type="number"
                        min={0}
                        max={12}
                        step={1}
                        value={furnRooms}
                        onChange={(e) =>
                          setFurnRooms(
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                      />
                      <div className="hint">
                        Number of rooms to have furniture moved
                      </div>
                    </div>
                    {hasFurnitureRooms ? (
                      <div className="num-field">
                        <label className="label-with-info">
                          <span>How much furniture is there?</span>
                          <span
                            className="info-dot"
                            title="Select the amount of furniture to be moved in the selected rooms"
                          >
                            i
                          </span>
                        </label>
                        <select
                          value={tierKey}
                          onChange={(e) => setTierKey(e.target.value)}
                        >
                          {tiers.map((t, i) => (
                            <option
                              key={t._key ?? `t-${i}`}
                              value={t._key ?? `t-${i}`}
                            >
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* STEP 4 */}
          <div className={`step${step === 4 ? " active" : ""}`}>
            {!zipOk || !q.hasAreas ? (
              <div className="validate error">
                You haven't selected any areas for carpet cleaning. Return to
                the Jobsite Details section to select areas to be cleaned.
              </div>
            ) : (
              <div>
                <div className="field-hint" style={{ marginBottom: 14 }}>
                  We have specific treatments and protocols for various
                  situations, including heavy soiling, pet urine, pet dander,
                  and stain removal. Check any that apply.
                </div>

                <div className="grid grid-2">
                  <div>
                    {treatmentDefs.map((t, i) => (
                      <label
                        key={t._key ?? `tr-${i}`}
                        className={`check-row${treatments[t.key] ? " selected" : ""}`}
                        style={{ marginBottom: 10 }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(treatments[t.key])}
                          onChange={(e) =>
                            setTreatments((s) => ({
                              ...s,
                              [t.key]: e.target.checked,
                            }))
                          }
                        />
                        <div className="ctxt">
                          <div className="title-txt">{t.label}</div>
                          {t.description ? (
                            <div className="sub-txt">{t.description}</div>
                          ) : null}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label
                      className={`check-row${stainsToggle ? " selected" : ""}`}
                      style={{ marginBottom: 10 }}
                    >
                      <input
                        type="checkbox"
                        checked={stainsToggle}
                        onChange={(e) => setStainsToggle(e.target.checked)}
                      />
                      <div className="ctxt">
                        <div className="title-txt">
                          Color Stains &amp; Spotting
                        </div>
                        <div className="sub-txt">
                          Color stains (Kool-Aid, coffee, wine, mustard) or
                          other spots
                        </div>
                      </div>
                    </label>

                    {stainsToggle ? (
                      <div>
                        <div className="field-hint">
                          <em>
                            These spots and stains usually require additional
                            treatments involving solvents, oxidizers, or
                            reducing agents.
                          </em>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div className="field-title" style={{ fontSize: 12 }}>
                            Amount of Oil, Grease, Gum, Candy or Wax Spots
                          </div>
                          <select
                            value={oilBracketKey}
                            onChange={(e) => setOilBracketKey(e.target.value)}
                          >
                            {oilBrackets.map((b, i) => (
                              <option
                                key={b._key ?? `o-${i}`}
                                value={b._key ?? `o-${i}`}
                              >
                                {b.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="num-field">
                          <label>
                            Number of Color Stains (Kool-Aid, coffee, mustard,
                            wine)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            step={1}
                            value={colorStains}
                            onChange={(e) =>
                              setColorStains(
                                Math.max(0, parseInt(e.target.value, 10) || 0)
                              )
                            }
                          />
                          <div className="hint">
                            We count stains up to the size of a hand. Larger
                            stains may count as more than one.
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 5 */}
          <div className={`step${step === 5 ? " active" : ""}`}>
            {!zipOk || !q.hasAreas ? (
              <div className="validate error">
                You haven't selected any areas for carpet cleaning. Return to
                the Jobsite Details section to select areas to be cleaned.
              </div>
            ) : (
              <div>
                <div className="total-area-row">
                  <div className="area-chip">
                    <div className="lbl">Total Area</div>
                    <div className="val">
                      <span>{Math.round(q.totalArea).toLocaleString()}</span> sq
                      ft
                    </div>
                  </div>
                  <div className="area-chip">
                    <div className="lbl">Traffic Area</div>
                    <div className="val">
                      <span>{Math.round(q.trafficArea).toLocaleString()}</span>{" "}
                      sq ft, cleanable
                    </div>
                  </div>
                </div>

                <div className="quote-avg">
                  <div className="lbl">Average</div>
                  <div className="val">
                    Around $<span>{Math.round(q.avg).toLocaleString()}</span>
                  </div>
                </div>

                <div className="quote-range">
                  <div className="quote-pill left">
                    <div className="lbl">Lower</div>
                    <div className="val">
                      $<span>{Math.round(q.lower).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="dash">to</div>
                  <div className="quote-pill right">
                    <div className="lbl">Higher</div>
                    <div className="val">
                      $<span>{Math.round(q.higher).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="quote-note">
                  {data?.quoteResultsNote ??
                    "An averaged square footage was used to make the calculations. Your service will likely fall between the Lower and Higher ranges listed, but prices vary."}
                </div>

                <div className="email-box">
                  <div className="field-title" style={{ marginBottom: 8 }}>
                    Email Results of this Quote
                  </div>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="send-btn"
                    onClick={() => {
                      if (!email.trim()) {
                        alert("Please enter your email.");
                        return;
                      }
                      alert(`Quote would be sent to: ${email}`);
                    }}
                  >
                    Send Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="progress-label">
            Step {step} of {totalSteps}
          </div>
        </div>

        <div className="nav">
          <button
            type="button"
            disabled={step === 1}
            onClick={goBack}
            aria-label="Back"
          >
            ←
          </button>
          <button
            type="button"
            disabled={step === totalSteps}
            onClick={goNext}
            aria-label="Next"
          >
            →
          </button>
        </div>

        {data?.disclaimerText ? (
          <div className="disclaimer">
            <em>Disclaimer:</em>{" "}
            {data.disclaimerText.replace(/^Disclaimer:\s*/i, "")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
