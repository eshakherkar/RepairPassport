import { describe, expect, it } from "vitest";
import { BILL_MAX_BYTES, checkBillFile, isOwnBillPath, toBillFormValues } from "./bill";
import { parseRepairForm } from "./repair-validation";

const user = "4e6c5199-a32b-4a68-b9f7-105446453675";
const file = "3f58211d-74db-4a04-85b1-3f41d2079d37";

describe("checkBillFile", () => {
  it("accepts photos and PDFs up to 4 MB", () => {
    expect(checkBillFile({ size: 1000, type: "image/jpeg" })).toBeNull();
    expect(checkBillFile({ size: BILL_MAX_BYTES, type: "application/pdf" })).toBeNull();
  });

  it("rejects empty, too large and other file types", () => {
    expect(checkBillFile({ size: 0, type: "image/png" })).not.toBeNull();
    expect(checkBillFile({ size: BILL_MAX_BYTES + 1, type: "image/png" })).not.toBeNull();
    expect(checkBillFile({ size: 1000, type: "text/html" })).not.toBeNull();
  });
});

describe("isOwnBillPath", () => {
  it("only accepts files in the user's own folder", () => {
    expect(isOwnBillPath(`${user}/${file}.pdf`, user)).toBe(true);
    expect(isOwnBillPath(`${file}/${file}.pdf`, user)).toBe(false); // someone else's folder
    expect(isOwnBillPath(`${user}/../${file}.pdf`, user)).toBe(false);
    expect(isOwnBillPath(`${user}/${file}.exe`, user)).toBe(false);
  });
});

describe("toBillFormValues", () => {
  it("keeps string fields, trims them, and blanks anything else", () => {
    const values = toBillFormValues({
      repairDate: " 2026-10-02 ",
      cost: 4850, // not a string: ignored
      issue: "Not cooling",
      extra: "ignored",
    });
    expect(values.repairDate).toBe("2026-10-02");
    expect(values.cost).toBe("");
    expect(values.issue).toBe("Not cooling");
    expect(toBillFormValues(null).issue).toBe("");
  });

  it("produces values the repair rules accept when the bill is complete", () => {
    const values = toBillFormValues({
      repairDate: "2026-10-02",
      issue: "Not cooling",
      workDone: "Replaced relay",
      cost: "4850.50",
      replacedParts: "Relay\nGas refill",
      serviceProvider: "CoolCare",
      warrantyExpiresOn: "2027-01-02",
      warrantyCoverage: "Relay",
      warrantyProvider: "CoolCare",
    });
    const result = parseRepairForm(values, "2026-11-21");
    expect(result.ok && result.repair.replacedParts).toEqual(["Relay", "Gas refill"]);
  });
});
