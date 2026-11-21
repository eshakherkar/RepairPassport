import { describe, expect, it } from "vitest";
import {
  parseRepairForm,
  parseRupees,
  splitParts,
  toRepairFormValues,
  type RepairFormValues,
} from "./repair-validation";

const today = "2026-11-21";
const valid: RepairFormValues = {
  repairDate: "2026-10-02",
  issue: "Not cooling",
  workDone: "",
  cost: "4850",
  replacedParts: "",
  serviceProvider: "CoolCare",
  warrantyExpiresOn: "",
  warrantyCoverage: "",
  warrantyProvider: "",
};
const errorsFor = (changes: Partial<RepairFormValues>) => {
  const result = parseRepairForm({ ...valid, ...changes }, today);
  return result.ok ? {} : result.fieldErrors;
};

describe("parseRupees", () => {
  it.each([
    ["4850", 4850],
    ["₹4,850.50", 4850.5],
    ["Rs. 4850", 4850],
    ["INR 1 00 000", 100000],
    ["0", 0],
  ])("reads %s as %d", (input, expected) => {
    expect(parseRupees(input)).toBe(expected);
  });

  it.each(["abc", "-5", "10.555", "4850.", ".5", "1e3", ""])("rejects %j", (input) => {
    expect(parseRupees(input)).toBeNull();
  });
});

describe("splitParts", () => {
  it("splits on lines and commas, dropping blanks and repeats", () => {
    expect(splitParts("Relay, Gas\nRelay\n\n Fan motor ")).toEqual(["Relay", "Gas", "Fan motor"]);
  });
});

describe("parseRepairForm", () => {
  it("accepts a valid repair and fills warranty defaults", () => {
    const result = parseRepairForm({ ...valid, warrantyExpiresOn: "2027-01-02" }, today);
    expect(result).toEqual({
      ok: true,
      repair: expect.objectContaining({
        cost: 4850,
        repairWarranty: {
          expiresOn: "2027-01-02",
          coverage: "Repair work and parts",
          provider: "CoolCare",
        },
      }),
    });
  });

  it("requires the date, problem, cost and provider", () => {
    expect(Object.keys(errorsFor({ repairDate: "", issue: "", cost: "", serviceProvider: "" })))
      .toEqual(["repairDate", "issue", "cost", "serviceProvider"]);
  });

  it("allows tomorrow (time-zone leeway) but not later", () => {
    expect(errorsFor({ repairDate: "2026-11-22" })).toEqual({});
    expect(errorsFor({ repairDate: "2026-11-23" })).toHaveProperty("repairDate");
  });

  it("rejects impossible dates and warranties ending before the repair", () => {
    expect(errorsFor({ repairDate: "2026-02-30" })).toHaveProperty("repairDate");
    expect(errorsFor({ warrantyExpiresOn: "2026-01-01" })).toHaveProperty("warrantyExpiresOn");
    expect(errorsFor({ warrantyCoverage: "Parts" })).toHaveProperty("warrantyExpiresOn");
  });

  it("rejects amounts the database can't store and too many parts", () => {
    expect(errorsFor({ cost: "99999999999" })).toHaveProperty("cost");
    const parts = Array.from({ length: 21 }, (_, i) => `Part ${i}`).join(",");
    expect(errorsFor({ replacedParts: parts })).toHaveProperty("replacedParts");
  });
});

describe("toRepairFormValues", () => {
  it("round-trips a saved repair through the form unchanged", () => {
    const values = toRepairFormValues({
      id: "r1",
      applianceId: "a1",
      repairDate: "2026-10-02",
      issue: "Not heating",
      workDone: "",
      cost: { amount: 2350.5, currency: "INR" },
      replacedParts: ["Heating element", "Thermostat"],
      serviceProvider: "Test Service",
      source: "manual",
    });
    expect(values.cost).toBe("2350.50");
    const result = parseRepairForm(values, today);
    expect(result.ok && result.repair.replacedParts).toEqual(["Heating element", "Thermostat"]);
    expect(result.ok && result.repair.cost).toBe(2350.5);
  });
});
