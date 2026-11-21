import { describe, expect, it } from "vitest";
import {
  isRecordId,
  parseApplianceForm,
  type ApplianceFormValues,
} from "./appliance-validation";

const today = "2026-11-21";
const valid: ApplianceFormValues = {
  name: "Kitchen fridge",
  category: "refrigerator",
  brand: "LG",
  model: "GL-123",
  serialNumber: "",
  location: "Kitchen",
  purchaseDate: "2024-05-01",
  warrantyExpiresOn: "",
  warrantyCoverage: "",
  warrantyProvider: "",
};
const errorsFor = (changes: Partial<ApplianceFormValues>) => {
  const result = parseApplianceForm({ ...valid, ...changes }, today);
  return result.ok ? {} : result.fieldErrors;
};

describe("parseApplianceForm", () => {
  it("accepts a valid appliance without a warranty", () => {
    expect(parseApplianceForm(valid, today)).toEqual({
      ok: true,
      appliance: expect.objectContaining({ serialNumber: null, manufacturerWarranty: null }),
    });
  });

  it("defaults warranty coverage and provider when only the end date is given", () => {
    const result = parseApplianceForm({ ...valid, warrantyExpiresOn: "2026-05-01" }, today);
    expect(result.ok && result.appliance.manufacturerWarranty).toEqual({
      expiresOn: "2026-05-01",
      coverage: "Full appliance",
      provider: "LG",
    });
  });

  it("requires the name, type, brand, model, location and purchase date", () => {
    const empty = Object.fromEntries(Object.keys(valid).map((k) => [k, ""]));
    expect(Object.keys(errorsFor(empty))).toEqual([
      "name",
      "category",
      "brand",
      "model",
      "location",
      "purchaseDate",
    ]);
  });

  it("rejects unknown types, including object property names", () => {
    expect(errorsFor({ category: "toaster" })).toHaveProperty("category");
    expect(errorsFor({ category: "toString" })).toHaveProperty("category");
  });

  it("rejects future, impossible and very old purchase dates", () => {
    expect(errorsFor({ purchaseDate: "2026-12-25" })).toHaveProperty("purchaseDate");
    expect(errorsFor({ purchaseDate: "2026-02-30" })).toHaveProperty("purchaseDate");
    expect(errorsFor({ purchaseDate: "1949-12-31" })).toHaveProperty("purchaseDate");
  });

  it("rejects a warranty ending before purchase, and over-long text", () => {
    expect(errorsFor({ warrantyExpiresOn: "2023-01-01" })).toHaveProperty("warrantyExpiresOn");
    expect(errorsFor({ name: "x".repeat(101) })).toHaveProperty("name");
  });
});

describe("isRecordId", () => {
  it("accepts UUIDs only", () => {
    expect(isRecordId("3f58211d-74db-4a04-85b1-3f41d2079d37")).toBe(true);
    expect(isRecordId("kitchen-fridge")).toBe(false);
    expect(isRecordId("3f58211d-74db-4a04-85b1-3f41d2079d37' or 1=1")).toBe(false);
  });
});
