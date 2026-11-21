import type {
  Appliance,
  ApplianceProfile,
  ApplianceSummary,
  DashboardStats,
  ISODate,
  RepairRecord,
  RepairWithAppliance,
  WarrantyEntry,
} from "../types";
import { getApplianceCoverage, getWarrantyStatus } from "../warranty";

/*
 * PURE CALCULATIONS
 * -----------------
 * Everything the pages show is worked out here from two plain lists
 * (appliances and repairs). No database, no dates read from the clock:
 * the same input always gives the same output, which makes these easy
 * to test. lib/data/appliances.ts fetches the lists and calls these.
 */

export function sortByName(appliances: Appliance[]): Appliance[] {
  return [...appliances].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortNewestFirst<T extends { repairDate: ISODate }>(records: T[]): T[] {
  // ISO dates sort correctly as plain text: "2026-11-08" > "2026-10-05".
  return [...records].sort((a, b) => b.repairDate.localeCompare(a.repairDate));
}

/** Manufacturer warranties plus warranties on repairs, as one list. */
export function collectWarranties(
  appliances: Appliance[],
  repairs: RepairRecord[],
): WarrantyEntry[] {
  const manufacturer: WarrantyEntry[] = appliances.flatMap((appliance) =>
    appliance.manufacturerWarranty
      ? [{ ...appliance.manufacturerWarranty, applianceId: appliance.id, kind: "manufacturer" as const }]
      : [],
  );
  const repair: WarrantyEntry[] = repairs.flatMap((record) =>
    record.repairWarranty
      ? [
          {
            ...record.repairWarranty,
            applianceId: record.applianceId,
            kind: "repair" as const,
            repairId: record.id,
          },
        ]
      : [],
  );
  return [...manufacturer, ...repair];
}

/** The most recent repairs across all appliances, with appliance details. */
export function recentRepairs(
  appliances: Appliance[],
  repairs: RepairRecord[],
  limit: number,
): RepairWithAppliance[] {
  const appliancesById = new Map(appliances.map((a) => [a.id, a]));
  return sortNewestFirst(repairs)
    .slice(0, limit)
    .flatMap((repair) => {
      const appliance = appliancesById.get(repair.applianceId);
      if (!appliance) return [];
      const { id, name, category } = appliance;
      return [{ ...repair, appliance: { id, name, category } }];
    });
}

/** Each appliance (sorted by name) with its repair count, last repair and cover. */
export function summarizeAppliances(
  appliances: Appliance[],
  repairs: RepairRecord[],
  today: ISODate,
): ApplianceSummary[] {
  const warranties = collectWarranties(appliances, repairs);
  return sortByName(appliances).map((appliance) => {
    const own = sortNewestFirst(repairs.filter((r) => r.applianceId === appliance.id));
    return {
      appliance,
      repairCount: own.length,
      lastRepairDate: own[0]?.repairDate,
      coverage: getApplianceCoverage(
        warranties.filter((w) => w.applianceId === appliance.id),
        today,
      ),
    };
  });
}

/** Everything for one appliance's profile, or undefined if it isn't in the list. */
export function buildProfile(
  appliances: Appliance[],
  repairs: RepairRecord[],
  applianceId: string,
): ApplianceProfile | undefined {
  const appliance = appliances.find((a) => a.id === applianceId);
  if (!appliance) return undefined;

  const own = repairs.filter((r) => r.applianceId === applianceId);
  const warranties = collectWarranties([appliance], own).sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "manufacturer" ? -1 : 1;
    return b.expiresOn.localeCompare(a.expiresOn);
  });

  return { appliance, repairs: sortNewestFirst(own), warranties };
}

/** Numbers for the dashboard's overview cards. */
export function dashboardStats(
  appliances: Appliance[],
  repairs: RepairRecord[],
  today: ISODate,
): DashboardStats {
  const statuses = collectWarranties(appliances, repairs).map((w) =>
    getWarrantyStatus(w.expiresOn, today),
  );
  return {
    applianceCount: appliances.length,
    repairCount: repairs.length,
    activeWarrantyCount: statuses.filter((s) => s !== "expired").length,
    expiringSoonCount: statuses.filter((s) => s === "expiring-soon").length,
  };
}
