"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../auth/session";
import {
  parseApplianceForm,
  readApplianceForm,
  type ApplianceFieldErrors,
  type ApplianceFormValues,
} from "../appliance-validation";
import type { TablesInsert } from "../supabase/database.types";
import { createClient } from "../supabase/server";
import { toISODate } from "../warranty";

export type ApplianceFormState = {
  /** A message about the whole form, e.g. a database problem. */
  error?: string;
  fieldErrors?: ApplianceFieldErrors;
  /** Sent back so the form keeps what the user typed. */
  values?: ApplianceFormValues;
  /** Counts submissions, so the form can refill its fields each time. */
  attempt: number;
};

/**
 * Saves a new appliance for the signed-in user, then opens its profile.
 *
 * Runs as the user, so Row Level Security applies: the database fills in
 * user_id itself and nobody else can see the appliance.
 */
export async function createAppliance(
  previous: ApplianceFormState,
  formData: FormData,
): Promise<ApplianceFormState> {
  await requireUser();
  const attempt = previous.attempt + 1;

  const values = readApplianceForm(formData);
  const result = parseApplianceForm(values, toISODate(new Date()));
  if (!result.ok) {
    return { attempt, values, fieldErrors: result.fieldErrors };
  }

  const { appliance } = result;
  const row: TablesInsert<"appliances"> = {
    name: appliance.name,
    category: appliance.category,
    brand: appliance.brand,
    model: appliance.model,
    serial_number: appliance.serialNumber,
    location: appliance.location,
    purchase_date: appliance.purchaseDate,
    manufacturer_warranty_expires_on: appliance.manufacturerWarranty?.expiresOn ?? null,
    manufacturer_warranty_coverage: appliance.manufacturerWarranty?.coverage ?? null,
    manufacturer_warranty_provider: appliance.manufacturerWarranty?.provider ?? null,
  };

  const supabase = await createClient();
  const { data, error } = await supabase.from("appliances").insert(row).select("id").single();

  if (error || !data) {
    return {
      attempt,
      values,
      error: "Couldn’t save the appliance. Please check your connection and try again.",
    };
  }

  // Show the new appliance on the dashboard and lists straight away.
  revalidatePath("/", "layout");
  redirect(`/appliances/${data.id}`); // Outside try/catch: redirect() works by throwing.
}
