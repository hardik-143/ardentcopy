"use client";

import { useEffect, useMemo, useState } from "react";

import "./commercial-calculator.css";
import type { CommercialCalculatorDoc } from "./types";

const DEFAULT_PRICING = {
  baseRate: 0.32,
  minDay: 300,
  minAH1: 450,
  minAH2: 600,
  floorAH1: 0.48,
  floorAH2: 0.64,
  rangeVariance: 0.2,
};

const DEFAULT_FURNISHINGS = [
  { _key: "f-some",       label: "Some furnishings (i.e. a few desk, chairs, cabinets)",             multiplier: 0.875, isDefault: true  },
  { _key: "f-cubicles",   label: "Numerous cubicles w/desks, chairs, etc... (i.e. office building)", multiplier: 1,     isDefault: false },
  { _key: "f-restaurant", label: "Tables, chairs & booths (i.e. restaurant)",                        multiplier: 1,     isDefault: false },
  { _key: "f-vacant",     label: "Vacant or mostly empty/open spaces",                               multiplier: 0.875, isDefault: false },
];

const DEFAULT_ADDONS = [
  { _key: "a-heavy",  title: "Heavy Cleaning",       description: "Mechanical agitation with CRB or rotary extraction",          rateAddition: 0.12, isActive: true },
  { _key: "a-grease", title: "Heavy Grease or Oil",  description: "Heavy grease or oil removal (i.e. restaurants, auto service)", rateAddition: 0.18, isActive: true },
  { _key: "a-deo",    title: "Deodorize",             description: "Treatments for odors such as mildew, pet, or other",          rateAddition: 0.16, isActive: true },
];

const DEFAULT_BUILDING_TYPES = [
  { _key: "b-1", label: "Store/Retail",               isActive: true },
  { _key: "b-2", label: "Office/Government Building",  isActive: true },
  { _key: "b-3", label: "Small Office(s)/Reception",   isActive: true },
  { _key: "b-4", label: "Church/School/Classrooms",    isActive: true },
  { _key: "b-5", label: "Restaurant",                  isActive: true },
  { _key: "b-6", label: "Other (not listed)",           isActive: true },
];

function normalizeMult(m: number): number {
  if (!m || m <= 0) return 0;
  if (m <= 5) return m;
  if (m <= 200) return m / 100;
  return m / 1000;
}

function normalizeRate(r: number): number {
  if (!r || r <= 0) return 0;
  if (r <= 2) return r;
  if (r <= 100) return r / 100;
  return r / 1000;
}

type CalcInput = {
  sqft: number;
  furnish: number;
  addonSum: number;
  evening: number;
  startTime: number;
};

function compute(input: CalcInput, pricing: typeof DEFAULT_PRICING) {
  const { sqft, furnish, addonSum, evening, startTime } = input;
  if (!sqft || !furnish) return null;

  const rate = pricing.baseRate + addonSum;
  const base = sqft * rate * furnish;
  const ah1  = sqft * Math.max(rate, pricing.floorAH1) * furnish;
  const ah2  = sqft * Math.max(rate, pricing.floorAH2) * furnish;

  const isAH  = evening === 1 && startTime > 0;
  const isAH2 = isAH && startTime === 0.32;
  const raw   = !isAH ? base : isAH2 ? ah2 : ah1;
  const min   = !isAH ? pricing.minDay : isAH2 ? pricing.minAH2 : pricing.minAH1;
  const variance = pricing.rangeVariance ?? 0.2;

  return {
    total: Math.max(raw, min),
    less:  Math.max(raw * (1 - variance), min),
    more:  Math.max(raw * (1 + variance), min),
  };
}

const fmt = (n: number) => `$ ${Math.round(n).toLocaleString()}`;

export function CommercialCalculator({
  data,
  title,
  anchorId,
}: {
  data: CommercialCalculatorDoc | null;
  title?: string | null;
  anchorId?: string | null;
}) {
  const pricing = {
    ...DEFAULT_PRICING,
    ...(data?.pricing ?? {}),
  } as typeof DEFAULT_PRICING;

  const furnishings = useMemo(() => {
    const raw = data?.furnishings ?? [];
    const source = raw.length > 0 ? raw : DEFAULT_FURNISHINGS;
    return source.filter((f) => f.label && f.multiplier != null);
  }, [data?.furnishings]);

  const buildingTypes = useMemo(() => {
    const raw = data?.buildingTypes ?? [];
    const source = raw.length > 0 ? raw : DEFAULT_BUILDING_TYPES;
    return source.filter((b) => b.isActive !== false && b.label);
  }, [data?.buildingTypes]);

  const addons = useMemo(() => {
    const raw = data?.addons ?? [];
    const source = raw.length > 0 ? raw : DEFAULT_ADDONS;
    return source.filter((a) => a.isActive !== false && a.title && a.rateAddition != null);
  }, [data?.addons]);

  const defaultFurnishingIdx = useMemo(() => {
    const idx = furnishings.findIndex((f) => f.isDefault);
    return idx === -1 ? 0 : idx;
  }, [furnishings]);

  const [sqft, setSqft] = useState(0);
  const [buildingId, setBuildingId] = useState<string>(buildingTypes[0]?._key ?? "");
  const [furnishIdx, setFurnishIdx] = useState<number>(defaultFurnishingIdx);
  const [addonChecked, setAddonChecked] = useState<Record<string, boolean>>({});
  const [evening, setEvening] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => { setFurnishIdx(defaultFurnishingIdx); }, [defaultFurnishingIdx]);

  useEffect(() => {
    if (!buildingId && buildingTypes[0]?._key) setBuildingId(buildingTypes[0]._key);
  }, [buildingId, buildingTypes]);

  const furnishMultiplier = normalizeMult(furnishings[furnishIdx]?.multiplier ?? 0);

  const addonSum = addons.reduce((sum, a, i) => {
    const key = a._key ?? `addon-${i}`;
    return sum + (addonChecked[key] ? normalizeRate(a.rateAddition ?? 0) : 0);
  }, 0);

  const result = compute({ sqft, furnish: furnishMultiplier, addonSum, evening, startTime }, pricing);
  const showStartTime = evening === 1;
  const stepSqft = (delta: number) => setSqft((s) => Math.max(0, Math.min(1_000_000, s + delta)));

  return (
    <section className="ardent-commercial-calc" id={anchorId || undefined}>
      <div className="calc">

        {/* Header */}
        <div className="header-band">
          <h1>{title || data?.title || "Commercial Carpet Cleaning Quote Calculater"}</h1>
        </div>

        {/* Intro */}
        {(data?.introText) && (
          <div className="intro">{data.introText}</div>
        )}
        {!data?.introText && (
          <div className="intro">
            This calculater will help us give you a rough quote by selecting the approximate square footage (to the nearest 100 is okay) and asking a few related questions about the cleaning.
          </div>
        )}

        {/* Property Information + Furnishings */}
        <div className="section">
          <div className="section-title">Property Information</div>
          <div className="cols">

            {/* Left column */}
            <div>
              <div className="field">
                <div className="label">
                  Approximate Square Footage of Carpet
                  <span className="info-dot" title="Enter the total, wall-to-wall estimated square footage of the carpeted areas to be cleaned (increments of 100)">i</span>
                </div>
                <div className="stepper-wrap">
                  <div className="stepper">
                    <button type="button" aria-label="Decrease" onClick={() => stepSqft(-100)}>−</button>
                    <input
                      type="number"
                      value={sqft}
                      min={0}
                      max={1_000_000}
                      step={100}
                      onChange={(e) => setSqft(Math.max(0, Math.min(1_000_000, parseInt(e.target.value, 10) || 0)))}
                    />
                    <button type="button" aria-label="Increase" onClick={() => stepSqft(100)}>+</button>
                  </div>
                  <div className="unit">{"square\nfeet"}</div>
                </div>
              </div>

              {buildingTypes.length > 0 && (
                <div className="field">
                  <div className="label">
                    Type of Building?
                    <span className="info-dot" title="Select the closest match that best describes the type of building">i</span>
                  </div>
                  <select value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
                    {buildingTypes.map((b, i) => (
                      <option key={b._key ?? `b-${i}`} value={b._key ?? `b-${i}`}>{b.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right column */}
            <div>
              <div className="field">
                <div className="label">
                  Contents or Furnishings Present
                  <span className="info-dot" title="Select the best description of contents/furnishings that will be present">i</span>
                </div>
                <div className="radio-list">
                  {furnishings.map((f, i) => (
                    <label key={f._key ?? `f-${i}`}>
                      <input
                        type="radio"
                        name="furnish"
                        checked={furnishIdx === i}
                        onChange={() => setFurnishIdx(i)}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Special Considerations + Evening */}
        <div className="section">
          <div className="cols">

            {/* Left column */}
            <div>
              <div className="section-title">Special Considerations</div>
              {addons.map((a, i) => {
                const id = a._key ?? `addon-${i}`;
                return (
                  <div className="check-group" key={id}>
                    <div className="check-label">{a.title}</div>
                    <div className="check-row">
                      <input
                        id={`cc-addon-${id}`}
                        type="checkbox"
                        checked={Boolean(addonChecked[id])}
                        onChange={(e) => setAddonChecked((s) => ({ ...s, [id]: e.target.checked }))}
                      />
                      <label htmlFor={`cc-addon-${id}`}>{a.description}</label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right column */}
            <div>
              <div className="field">
                <div className="label">Does the service need to be performed in the evening?</div>
                <div className="radio-list">
                  <label>
                    <input type="radio" name="evening" checked={evening === 1} onChange={() => setEvening(1)} />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="evening"
                      checked={evening === 0}
                      onChange={() => { setEvening(0); setStartTime(0); }}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className={`field time-field${showStartTime ? "" : " hidden"}`}>
                <div className="label">Starting Time</div>
                <select value={startTime} onChange={(e) => setStartTime(parseFloat(e.target.value))}>
                  <option value={0}>Starting before 6:00 pm (&lt;18:00)</option>
                  <option value={0.16}>Starting between 6:00 &amp; 9:59 pm (18:00-21:59)</option>
                  <option value={0.32}>Starting at 10:00 pm or later (22:00-06:59)</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Rough Quote */}
        {result && (
          <div className="quote-section">
            <div className="section-title">Rough Quote</div>
            <div className="quote-grid">

              {/* Left: quote box + email */}
              <div>
                <div className="quote-total">
                  <div className="small-label">Quote Total</div>
                  <div className="big-amount">Around {fmt(result.total)}</div>
                </div>
                <div className="quote-range">
                  <div className="range-header">
                    <span>Less Area <span className="info-dot" title="20% less area to clean">i</span></span>
                    <span>More Area <span className="info-dot" title="20% more area to clean">i</span></span>
                  </div>
                  <div className="range-amounts">
                    <span>{fmt(result.less)}</span>
                    <span className="sep">to</span>
                    <span>{fmt(result.more)}</span>
                  </div>
                </div>

                {/* Email — nested under the quote box */}
                <div className="email-section">
                  <div className="email-label">Email Results</div>
                  <input
                    type="email"
                    className="email-input"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="send-btn"
                    onClick={() => {
                      if (!email.trim()) { alert("Please enter your email."); return; }
                      alert(`Quote would be sent to: ${email}`);
                    }}
                  >
                    Send Results
                  </button>
                </div>
              </div>

              {/* Right: note */}
              <div className="quote-note">
                {data?.quoteNote ??
                  'This is a rough quote for the square footage inputted, along with a lower and upper range, representing 20% less or 20% more area for cleaning, respectively. This quote is a "ballpark" figure for informational purposes only. We\'ll need to assess and measure the carpet to provide you with an accurate estimate. Please note that our cleaning rates include dry vacuuming before the wet cleaning.'}
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
