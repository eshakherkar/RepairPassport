import { describe, expect, it } from "vitest";
import { getReplacementAdvice } from "./replacement-advice";

const repairs = (...amounts: number[]) =>
  amounts.map((amount) => ({ cost: { amount, currency: "INR" as const } }));

// Fridge: typical ₹30,000, 12 years.
describe("getReplacementAdvice", () => {
  const today = "2026-11-23";

  it("says repair for a young appliance with cheap repairs", () => {
    const advice = getReplacementAdvice("refrigerator", "2024-11-23", repairs(2000, 1000), today);
    expect(advice).toMatchObject({ verdict: "repair", spent: 3000, typicalPrice: 30000 });
    expect(advice.spentShare).toBeCloseTo(0.1);
    expect(advice.ageYears).toBeCloseTo(2, 1);
  });

  it("says watch from 30% of the new price, or 75% of its lifespan", () => {
    expect(getReplacementAdvice("refrigerator", "2024-11-23", repairs(9000), today).verdict).toBe("watch");
    expect(getReplacementAdvice("refrigerator", "2017-11-01", [], today).verdict).toBe("watch"); // just over 9 years
  });

  it("says replace from half the new price, or past its lifespan", () => {
    expect(getReplacementAdvice("refrigerator", "2024-11-23", repairs(10000, 5000), today).verdict).toBe("replace");
    expect(getReplacementAdvice("refrigerator", "2014-11-01", [], today).verdict).toBe("replace"); // just over 12 years
  });

  it("just under the thresholds stays a level lower", () => {
    expect(getReplacementAdvice("refrigerator", "2024-11-23", repairs(8999), today).verdict).toBe("repair");
    expect(getReplacementAdvice("refrigerator", "2024-11-23", repairs(14999), today).verdict).toBe("watch");
  });

  it("treats a future purchase date as brand new", () => {
    expect(getReplacementAdvice("microwave", "2026-11-24", [], today).ageYears).toBe(0);
  });
});
