"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import type { TablesInsert } from "../supabase/database.types";
import { createClient } from "../supabase/server";
import { sampleAppliances, sampleRepairs } from "./sample-data";

export type LoadSampleDataState = { error?: string };

/**
 * Copies the five fictional sample appliances (and their repairs) into the
 * signed-in user's account, so a brand-new account has something to show.
 *
 * Runs as the user, so Row Level Security applies: rows are stored with
 * the user's ID automatically and nobody else can see them. It refuses if
 * the account already has appliances, so it can't create duplicates.
 */
export async function loadSampleData(): Promise<LoadSampleDataState> {
  await requireUser();
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("appliances")
    .select("id", { count: "exact", head: true });
  if (countError) return { error: "Couldn't check your account. Please try again." };
  if ((count ?? 0) > 0) {
    return { error: "Your account already has appliances, so sample data wasn't added." };
  }

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
    return { error: "Couldn't add the sample appliances. Please try again." };
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
    return { error: "Couldn't add the sample repairs. Please try again." };
  }

  // Show the new data on every page.
  revalidatePath("/", "layout");
  return {};
}
