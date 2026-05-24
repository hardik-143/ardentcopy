"use client";

import { CommercialCalculator } from "../calculators/commercial-calculator";
import { ResidentialCalculator } from "../calculators/residential-calculator";
import type {
  CommercialCalculatorDoc,
  ResidentialCalculatorDoc,
} from "../calculators/types";

export type CarpetCalculatorBlockProps = {
  readonly _key: string;
  readonly _type: "carpetCalculator";
  readonly calculatorType?: "commercial" | "residential" | null;
  readonly title?: string | null;
  readonly anchorId?: string | null;
  readonly commercialCalculator?: CommercialCalculatorDoc | null;
  readonly residentialCalculator?: ResidentialCalculatorDoc | null;
};

export function CarpetCalculatorBlock({
  calculatorType,
  title,
  anchorId,
  commercialCalculator,
  residentialCalculator,
}: CarpetCalculatorBlockProps) {
  if (calculatorType === "residential") {
    return (
      <ResidentialCalculator
        data={residentialCalculator ?? null}
        title={title}
        anchorId={anchorId}
      />
    );
  }
  return (
    <CommercialCalculator
      data={commercialCalculator ?? null}
      title={title}
      anchorId={anchorId}
    />
  );
}
