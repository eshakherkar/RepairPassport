/**
 * Core data shapes for RepairPassport.
 *
 * These types describe household appliances and their repair history.
 * Every page and component uses them, so the whole app agrees on what
 * an "appliance" or a "repair record" contains.
 */

/** The kinds of household appliance RepairPassport supports. */
export type ApplianceCategory =
  | "refrigerator"
  | "washing-machine"
  | "dishwasher"
  | "oven"
  | "microwave"
  | "air-conditioner"
  | "water-heater"
  | "water-purifier"
  | "other";

/**
 * A calendar date in `YYYY-MM-DD` format, e.g. "2026-11-20".
 * Plain dates avoid time-zone surprises: a repair on 5 March is
 * 5 March everywhere.
 */
export type ISODate = string;

export type CurrencyCode = "INR";

/** An amount of money in the currency's main unit (rupees, not paise). */
export type Money = {
  amount: number;
  currency: CurrencyCode;
};

/** Warranty cover, either from the manufacturer or from a repair. */
export type WarrantyInfo = {
  /** Last day the warranty is valid (inclusive). */
  expiresOn: ISODate;
  /** What is covered, e.g. "Full appliance" or "Replaced magnetron". */
  coverage: string;
  /** Who honours the warranty, e.g. the manufacturer or repair company. */
  provider: string;
};

export type Appliance = {
  /** URL-friendly unique ID, used in links like /appliances/kitchen-refrigerator */
  id: string;
  /** Friendly name chosen by the owner, e.g. "Kitchen refrigerator". */
  name: string;
  category: ApplianceCategory;
  brand: string;
  model: string;
  serialNumber?: string;
  /** Room or place in the home, e.g. "Kitchen". */
  location: string;
  purchaseDate: ISODate;
  /** The manufacturer's original warranty, if known. */
  manufacturerWarranty?: WarrantyInfo;
};

/**
 * Where a repair record's details came from.
 * - "manual": typed in by the user
 * - "ai-extracted": read from an uploaded bill by AI and confirmed by the user
 * - "needs-review": read by AI but not yet confirmed by the user
 */
export type RecordSource = "manual" | "ai-extracted" | "needs-review";

export type RepairRecord = {
  id: string;
  /** The `id` of the appliance this repair belongs to. */
  applianceId: string;
  repairDate: ISODate;
  /** The problem, in a few words, e.g. "Not cooling". */
  issue: string;
  /** What the technician did. */
  workDone: string;
  cost: Money;
  replacedParts: string[];
  /** Repair company or service centre (a business, never a private person). */
  serviceProvider: string;
  /** Warranty on this repair or its parts, if the bill mentions one. */
  repairWarranty?: WarrantyInfo;
  source: RecordSource;
};

/** A repair record together with the appliance it belongs to. */
export type RepairWithAppliance = RepairRecord & {
  appliance: Pick<Appliance, "id" | "name" | "category">;
};

/** How a warranty stands on a given day. */
export type WarrantyStatus = "active" | "expiring-soon" | "expired";

/** One warranty, flattened from either an appliance or a repair record. */
export type WarrantyEntry = WarrantyInfo & {
  applianceId: string;
  kind: "manufacturer" | "repair";
  /** Set when `kind` is "repair". */
  repairId?: string;
};

/**
 * The best warranty cover an appliance has today.
 * - "manufacturer": the whole appliance is covered
 * - "repair": only a repaired part is covered
 * - "none": nothing is covered
 */
export type ApplianceCoverage =
  | {
      kind: "manufacturer" | "repair";
      status: Exclude<WarrantyStatus, "expired">;
      expiresOn: ISODate;
    }
  | { kind: "none" };

/** An appliance plus the facts its card needs. */
export type ApplianceSummary = {
  appliance: Appliance;
  repairCount: number;
  lastRepairDate?: ISODate;
  coverage: ApplianceCoverage;
};

/** Everything an appliance's profile page shows. */
export type ApplianceProfile = {
  appliance: Appliance;
  /** Newest first. */
  repairs: RepairRecord[];
  /** Manufacturer warranty first, then repair warranties, latest-ending first. */
  warranties: WarrantyEntry[];
};

export type DashboardStats = {
  applianceCount: number;
  repairCount: number;
  /** Warranties still valid today, including those expiring soon. */
  activeWarrantyCount: number;
  /** The subset of active warranties that end within the warning window. */
  expiringSoonCount: number;
};
