import { describe, expect, it } from "vitest";
import { dashboardStats } from "./data/derive";
import { sampleAppliances, sampleRepairs } from "./data/sample-data";
import { getApplianceCoverage, getWarrantyStatus } from "./warranty";
import type { WarrantyEntry } from "./types";

describe("getWarrantyStatus", () => {
  it.each([
    ["2026-11-20", "expiring-soon"], // its last day still counts as covered
    ["2026-12-20", "expiring-soon"], // 30 days left
    ["2026-12-21", "active"], // 31 days left
    ["2026-11-19", "expired"],
  ])("a warranty ending %s is %s on 2026-11-20", (expiresOn, status) => {
    expect(getWarrantyStatus(expiresOn, "2026-11-20")).toBe(status);
  });
});

describe("getApplianceCoverage", () => {
  const entry = (kind: WarrantyEntry["kind"], expiresOn: string): WarrantyEntry => ({
    kind,
    expiresOn,
    applianceId: "a1",
    coverage: "",
    provider: "",
  });

  it("prefers a valid manufacturer warranty over a longer repair warranty", () => {
    const coverage = getApplianceCoverage(
      [entry("repair", "2028-01-01"), entry("manufacturer", "2027-01-01")],
      "2026-11-20",
    );
    expect(coverage).toEqual({ kind: "manufacturer", status: "active", expiresOn: "2027-01-01" });
  });

  it("falls back to the longest repair warranty, then to none", () => {
    expect(
      getApplianceCoverage(
        [entry("manufacturer", "2025-01-01"), entry("repair", "2027-01-01"), entry("repair", "2027-06-01")],
        "2026-11-20",
      ),
    ).toEqual({ kind: "repair", status: "active", expiresOn: "2027-06-01" });
    expect(getApplianceCoverage([entry("manufacturer", "2025-01-01")], "2026-11-20")).toEqual({
      kind: "none",
    });
  });
});

describe("dashboardStats", () => {
  it("matches the numbers checked by hand on the sample data", () => {
    expect(dashboardStats(sampleAppliances, sampleRepairs, "2026-11-20")).toEqual({
      applianceCount: 5,
      repairCount: 6,
      activeWarrantyCount: 5,
      expiringSoonCount: 1,
    });
  });
});
