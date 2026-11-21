"use server";

/**
 * Server Actions for adding, editing and deleting appliances.
 *
 * They run as the signed-in user, so Row Level Security applies: the
 * database fills in user_id on new rows, and a user can only change or
 * delete their own appliances (anyone else's simply aren't found).
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../auth/session";
import {
  isRecordId,
  parseApplianceForm,
  readApplianceForm,
  type ApplianceFieldErrors,
  type ApplianceFormValues,
  type NewAppliance,
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

/** Saves a new appliance for the signed-in user, then opens its profile. */
export async function createAppliance(
  previous: ApplianceFormState,
  formData: FormData,
): Promise<ApplianceFormState> {
  await requireUser();
  const attempt = previous.attempt + 1;

  const values = readApplianceForm(formData);
  const result = parseApplianceForm(values, toISODate(new Date()));
  if (!result.ok) return { attempt, values, fieldErrors: result.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appliances")
    .insert(toRow(result.appliance))
    .select("id")
    .single();

  if (error || !data) {
    return {
      attempt,
      values,
      error:
        // Foreign key on user_id: the signed-in account no longer exists.
        error?.code === "23503"
          ? "Your sign-in is out of date. Please sign out, then sign in again."
          : "Couldn’t save the appliance. Please check your connection and try again.",
    };
  }

  // Show the new appliance on the dashboard and lists straight away.
  revalidatePath("/", "layout");
  redirect(`/appliances/${data.id}`); // Outside try/catch: redirect() works by throwing.
}

/**
 * Saves changes to one of the user's appliances, then opens its profile.
 * The ID is bound by the edit page (updateAppliance.bind(null, id)).
 */
export async function updateAppliance(
  applianceId: string,
  previous: ApplianceFormState,
  formData: FormData,
): Promise<ApplianceFormState> {
  await requireUser();
  const attempt = previous.attempt + 1;

  const values = readApplianceForm(formData);
  if (!isRecordId(applianceId)) {
    return { attempt, values, error: "This appliance doesn’t exist any more." };
  }

  const result = parseApplianceForm(values, toISODate(new Date()));
  if (!result.ok) return { attempt, values, fieldErrors: result.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appliances")
    .update(toRow(result.appliance))
    .eq("id", applianceId)
    .select("id");

  if (error) {
    return {
      attempt,
      values,
      error: "Couldn’t save your changes. Please check your connection and try again.",
    };
  }
  if (data.length === 0) {
    // Deleted in another tab, or not this user's appliance.
    return { attempt, values, error: "This appliance doesn’t exist any more." };
  }

  revalidatePath("/", "layout");
  redirect(`/appliances/${applianceId}`);
}

export type DeleteApplianceState = { error?: string };

/**
 * Deletes one of the user's appliances. The database also deletes its
 * repair records (ON DELETE CASCADE), so nothing is left behind.
 */
export async function deleteAppliance(applianceId: string): Promise<DeleteApplianceState> {
  await requireUser();
  if (!isRecordId(applianceId)) return { error: "This appliance doesn’t exist any more." };

  const supabase = await createClient();
  const { error } = await supabase.from("appliances").delete().eq("id", applianceId);
  if (error) {
    return { error: "Couldn’t delete the appliance. Please check your connection and try again." };
  }

  revalidatePath("/", "layout");
  redirect("/appliances");
}

/** A checked appliance as a database row (user_id is filled in by the database). */
function toRow(appliance: NewAppliance): TablesInsert<"appliances"> {
  return {
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
}
