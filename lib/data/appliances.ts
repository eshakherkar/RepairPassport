import type {
  Appliance,
  ApplianceSummary,
  DashboardStats,
  ISODate,
  RepairRecord,
  RepairWithAppliance,
  WarrantyEntry,
} from "../types";
import { getApplianceCoverage, getWarrantyStatus } from "../warranty";
import { mockAppliances, mockRepairs } from "./mock-data";

/*
 * DATA ACCESS LAYER
 * -----------------
 * Every page gets appliance and repair data through these functions.
 * They read fictional sample data for now. When we add a real database,
 * only the inside of these functions changes; pages stay the same.
 *
 * They are `async` because database calls are, so pages are already
 * written the way they will need to be later.
 */

/** All appliances, sorted by name. */
export async function getAppliances(): Promise<Appliance[]> {
  return [...mockAppliances].sort((a, b) => a.name.localeCompare(b.name));
}

/** One appliance by its ID, or `undefined` if it doesn't exist. */
export async function getApplianceById(
  applianceId: string,
): Promise<Appliance | undefined> {
  return mockAppliances.find((appliance) => appliance.id === applianceId);
}

/** An appliance's repairs, newest first. */
export async function getRepairsForAppliance(
  applianceId: string,
): Promise<RepairRecord[]> {
  return sortNewestFirst(
    mockRepairs.filter((repair) => repair.applianceId === applianceId),
  );
}

/** The most recent repairs across all appliances, with appliance details. */
export async function getRecentRepairs(
  limit = 5,
): Promise<RepairWithAppliance[]> {
  const appliancesById = new Map(mockAppliances.map((a) => [a.id, a]));

  return sortNewestFirst(mockRepairs)
    .slice(0, limit)
    .flatMap((repair) => {
      const appliance = appliancesById.get(repair.applianceId);
      if (!appliance) return [];
      const { id, name, category } = appliance;
      return [{ ...repair, appliance: { id, name, category } }];
    });
}

/** Every warranty: manufacturer warranties plus warranties on repairs. */
export async function getWarranties(): Promise<WarrantyEntry[]> {
  const manufacturer: WarrantyEntry[] = mockAppliances.flatMap((appliance) =>
    appliance.manufacturerWarranty
      ? [
          {
            ...appliance.manufacturerWarranty,
            applianceId: appliance.id,
            kind: "manufacturer" as const,
          },
        ]
      : [],
  );

  const repair: WarrantyEntry[] = mockRepairs.flatMap((record) =>
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

/**
 * Every appliance with its repair count, latest repair date and warranty
 * cover on `today`, sorted by name. Used by appliance cards.
 */
export async function getApplianceSummaries(
  today: ISODate,
): Promise<ApplianceSummary[]> {
  const [appliances, warranties] = await Promise.all([
    getAppliances(),
    getWarranties(),
  ]);

  return appliances.map((appliance) => {
    const repairs = sortNewestFirst(
      mockRepairs.filter((r) => r.applianceId === appliance.id),
    );
    return {
      appliance,
      repairCount: repairs.length,
      lastRepairDate: repairs[0]?.repairDate,
      coverage: getApplianceCoverage(
        warranties.filter((w) => w.applianceId === appliance.id),
        today,
      ),
    };
  });
}

/**
 * Numbers for the dashboard's overview cards.
 * `today` is passed in (rather than read here) so a page decides what
 * "today" is once, and the result is easy to test.
 */
export async function getDashboardStats(
  today: ISODate,
): Promise<DashboardStats> {
  const warranties = await getWarranties();
  const statuses = warranties.map((w) => getWarrantyStatus(w.expiresOn, today));

  return {
    applianceCount: mockAppliances.length,
    repairCount: mockRepairs.length,
    activeWarrantyCount: statuses.filter((s) => s !== "expired").length,
    expiringSoonCount: statuses.filter((s) => s === "expiring-soon").length,
  };
}

function sortNewestFirst<T extends { repairDate: ISODate }>(records: T[]): T[] {
  // ISO dates sort correctly as plain text: "2026-11-08" > "2026-10-05".
  return [...records].sort((a, b) => b.repairDate.localeCompare(a.repairDate));
}
