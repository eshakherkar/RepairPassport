import type { TablesInsert } from "../supabase/database.types";
import type { createClient } from "../supabase/server";
import { sampleAppliances, sampleRepairs } from "./sample-data";

/**
 * Copies the five fictional sample appliances and their repairs into the
 * account the given Supabase client is signed in as. Returns an error
 * message, or null on success. Used by "Load sample appliances" and by
 * "Try the demo" (right after the guest account is created).
 */
export async function copySampleData(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  // 1. Appliances. user_id is filled in by the database (default auth.uid()).
  const applianceRows: TablesInsert<"appliances">[] = sampleAppliances.map((a) => ({
    name: a.name,
    category: a.category,
    brand: a.brand,
    model: a.model,
    serial_number: a.serialNumber ?? null,
    location: a.location,
    purchase_date: a.purchaseDate,
    manufacturer_warranty_expires_on: a.manufacturerWarranty?.expiresOn ?? null,
    manufacturer_warranty_coverage: a.manufacturerWarranty?.coverage ?? null,
    manufacturer_warranty_provider: a.manufacturerWarranty?.provider ?? null,
  }));

  const { data: inserted, error: applianceError } = await supabase
    .from("appliances")
    .insert(applianceRows)
    .select("id, name");
  if (applianceError || !inserted) {
    return "Couldn't add the sample appliances. Please try again.";
  }

  // 2. Repairs, linked to the new appliance IDs (matched by appliance name).
  const newIdByName = new Map(inserted.map((row) => [row.name, row.id]));
  const nameBySampleId = new Map(sampleAppliances.map((a) => [a.id, a.name]));

  const repairRows: TablesInsert<"repairs">[] = sampleRepairs.map((r) => ({
    appliance_id: newIdByName.get(nameBySampleId.get(r.applianceId) ?? "") ?? "",
    repair_date: r.repairDate,
    issue: r.issue,
    work_done: r.workDone,
    cost_amount: r.cost.amount,
    cost_currency: r.cost.currency,
    replaced_parts: r.replacedParts,
    service_provider: r.serviceProvider,
    repair_warranty_expires_on: r.repairWarranty?.expiresOn ?? null,
    repair_warranty_coverage: r.repairWarranty?.coverage ?? null,
    repair_warranty_provider: r.repairWarranty?.provider ?? null,
    source: r.source,
  }));

  const { error: repairError } = await supabase.from("repairs").insert(repairRows);
  if (repairError) {
    // Undo the appliances so the account isn't left half-filled.
    await supabase
      .from("appliances")
      .delete()
      .in("id", inserted.map((row) => row.id));
    return "Couldn't add the sample repairs. Please try again.";
  }
  return null;
}
