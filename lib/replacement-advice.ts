/**
 * "Repair or replace?" advice: compares what an appliance has cost in
 * repairs, and how old it is, with a typical new price and lifespan.
 */

import type { ApplianceCategory, ISODate, RepairRecord } from "./types";
import { daysBetween } from "./warranty";

/**
 * Rough mid-range prices for a new appliance in India (₹) and typical
 * lifespans. Estimates only: the page says so.
 * shortcut: one fixed price per type, upgrade to the user's own price if they ask for it.
 */
export const TYPICAL: Record<ApplianceCategory, { price: number; lifespanYears: number }> = {
  refrigerator: { price: 30000, lifespanYears: 12 },
  "washing-machine": { price: 28000, lifespanYears: 10 },
  dishwasher: { price: 40000, lifespanYears: 10 },
  oven: { price: 20000, lifespanYears: 12 },
  microwave: { price: 12000, lifespanYears: 8 },
  "air-conditioner": { price: 40000, lifespanYears: 10 },
  "water-heater": { price: 10000, lifespanYears: 10 },
  "water-purifier": { price: 15000, lifespanYears: 7 },
  other: { price: 20000, lifespanYears: 10 },
};

/** "repair": still worth fixing. "watch": getting costly or old. "replace": consider a new one. */
export type ReplacementVerdict = "repair" | "watch" | "replace";

export type ReplacementAdvice = {
  verdict: ReplacementVerdict;
  /** Total spent on repairs, in rupees. */
  spent: number;
  typicalPrice: number;
  /** spent / typicalPrice, e.g. 0.42 for 42%. */
  spentShare: number;
  ageYears: number;
  lifespanYears: number;
};

/** Replace at half a new one's price or past its lifespan; watch from 30% or 75% of it. */
export function getReplacementAdvice(
  category: ApplianceCategory,
  purchaseDate: ISODate,
  repairs: Pick<RepairRecord, "cost">[],
  today: ISODate,
): ReplacementAdvice {
  const { price, lifespanYears } = TYPICAL[category];
  const spent = repairs.reduce((sum, r) => sum + r.cost.amount, 0);
  const spentShare = spent / price;
  const ageYears = Math.max(0, daysBetween(purchaseDate, today) / 365.25);
  const lifeShare = ageYears / lifespanYears;

  const verdict: ReplacementVerdict =
    spentShare >= 0.5 || lifeShare >= 1
      ? "replace"
      : spentShare >= 0.3 || lifeShare >= 0.75
        ? "watch"
        : "repair";

  return { verdict, spent, typicalPrice: price, spentShare, ageYears, lifespanYears };
}
