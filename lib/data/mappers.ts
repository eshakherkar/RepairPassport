import type { Tables } from "../supabase/database.types";
import type { Appliance, CurrencyCode, ISODate, RepairRecord, WarrantyInfo } from "../types";

/*
 * Translate database rows (snake_case columns) into the app's own types
 * (camelCase, nested warranty objects). Keeping this in one place means
 * pages and components never need to know how the database is laid out.
 */

type ApplianceRow = Tables<"appliances">;
type RepairRow = Tables<"repairs">;

/** The database stores a warranty as three columns: all set, or all empty. */
function toWarranty(
  expiresOn: ISODate | null,
  coverage: string | null,
  provider: string | null,
): WarrantyInfo | undefined {
  if (!expiresOn || !coverage || !provider) return undefined;
  return { expiresOn, coverage, provider };
}

export function toAppliance(row: ApplianceRow): Appliance {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    model: row.model,
    serialNumber: row.serial_number ?? undefined,
    location: row.location,
    purchaseDate: row.purchase_date,
    manufacturerWarranty: toWarranty(
      row.manufacturer_warranty_expires_on,
      row.manufacturer_warranty_coverage,
      row.manufacturer_warranty_provider,
    ),
  };
}

export function toRepair(row: RepairRow): RepairRecord {
  return {
    id: row.id,
    applianceId: row.appliance_id,
    repairDate: row.repair_date,
    issue: row.issue,
    workDone: row.work_done,
    cost: {
      amount: Number(row.cost_amount),
      // The database only accepts INR (see the cost_currency check).
      currency: row.cost_currency as CurrencyCode,
    },
    replacedParts: row.replaced_parts,
    serviceProvider: row.service_provider,
    repairWarranty: toWarranty(
      row.repair_warranty_expires_on,
      row.repair_warranty_coverage,
      row.repair_warranty_provider,
    ),
    source: row.source,
  };
}
