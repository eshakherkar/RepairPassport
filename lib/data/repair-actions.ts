"use server";

/**
 * Server Actions for repair records: log, edit and delete.
 *
 * They run as the signed-in user, so Row Level Security applies: the
 * database fills in user_id, its foreign key only accepts a repair for
 * one of the same user's appliances, and a user can only change or
 * delete their own repairs (anyone else's simply aren't found).
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRecordId } from "../appliance-validation";
import { requireUser } from "../auth/session";
import { DEFAULT_CURRENCY } from "../format";
import {
  parseRepairForm,
  readRepairForm,
  type NewRepair,
  type RepairFieldErrors,
  type RepairFormValues,
} from "../repair-validation";
import type { TablesUpdate } from "../supabase/database.types";
import { createClient } from "../supabase/server";
import { toISODate } from "../warranty";

export type RepairFormState = {
  /** A message about the whole form, e.g. a database problem. */
  error?: string;
  fieldErrors?: RepairFieldErrors;
  /** Sent back so the form keeps what the user typed. */
  values?: RepairFormValues;
  /** Counts submissions, so the form can refill its fields each time. */
  attempt: number;
};

export type DeleteRepairState = { error?: string };

/** Postgres error code for "foreign key violation" (no such appliance for this user). */
const FOREIGN_KEY_VIOLATION = "23503";
const GONE = "This repair or its appliance doesn’t exist any more.";

/**
 * Saves a repair typed in by hand, then opens the appliance's profile.
 * The appliance ID is bound by the page (createRepair.bind(null, id)).
 */
export async function createRepair(
  applianceId: string,
  previous: RepairFormState,
  formData: FormData,
): Promise<RepairFormState> {
  await requireUser();
  const attempt = previous.attempt + 1;

  const values = readRepairForm(formData);
  if (!isRecordId(applianceId)) return { attempt, values, error: GONE };

  const result = parseRepairForm(values, toISODate(new Date()));
  if (!result.ok) return { attempt, values, fieldErrors: result.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("repairs")
    .insert({ ...toRow(result.repair), appliance_id: applianceId, source: "manual" });

  if (error) {
    return {
      attempt,
      values,
      error:
        error.code === FOREIGN_KEY_VIOLATION
          ? GONE
          : "Couldn’t save the repair. Please check your connection and try again.",
    };
  }

  // Update the timeline, dashboard totals and warranty counts.
  revalidatePath("/", "layout");
  redirect(`/appliances/${applianceId}`); // Outside try/catch: redirect() works by throwing.
}

/**
 * Saves changes to a repair, then opens the appliance's profile.
 * Both IDs are bound by the edit page. Saving a repair that AI read from
 * a bill ("needs review") also marks it as reviewed.
 */
export async function updateRepair(
  applianceId: string,
  repairId: string,
  previous: RepairFormState,
  formData: FormData,
): Promise<RepairFormState> {
  await requireUser();
  const attempt = previous.attempt + 1;

  const values = readRepairForm(formData);
  if (!isRecordId(applianceId) || !isRecordId(repairId)) return { attempt, values, error: GONE };

  const result = parseRepairForm(values, toISODate(new Date()));
  if (!result.ok) return { attempt, values, fieldErrors: result.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("repairs")
    .update(toRow(result.repair))
    .eq("id", repairId)
    .eq("appliance_id", applianceId)
    .select("id");

  if (error) {
    return {
      attempt,
      values,
      error: "Couldn’t save your changes. Please check your connection and try again.",
    };
  }
  if (data.length === 0) return { attempt, values, error: GONE };

  // The user has now checked this record, so it no longer needs review.
  await supabase
    .from("repairs")
    .update({ source: "ai-extracted" })
    .eq("id", repairId)
    .eq("source", "needs-review");

  revalidatePath("/", "layout");
  redirect(`/appliances/${applianceId}`);
}

/** Deletes one repair, then opens the appliance's profile. Both IDs are bound by the page. */
export async function deleteRepair(
  applianceId: string,
  repairId: string,
): Promise<DeleteRepairState> {
  await requireUser();
  if (!isRecordId(applianceId) || !isRecordId(repairId)) return { error: GONE };

  const supabase = await createClient();
  const { error } = await supabase
    .from("repairs")
    .delete()
    .eq("id", repairId)
    .eq("appliance_id", applianceId);
  if (error) {
    return { error: "Couldn’t delete the repair. Please check your connection and try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/appliances/${applianceId}`);
}

/** A checked repair as database columns (shared by logging and editing). */
function toRow(repair: NewRepair) {
  return {
    repair_date: repair.repairDate,
    issue: repair.issue,
    work_done: repair.workDone,
    cost_amount: repair.cost,
    cost_currency: DEFAULT_CURRENCY,
    replaced_parts: repair.replacedParts,
    service_provider: repair.serviceProvider,
    repair_warranty_expires_on: repair.repairWarranty?.expiresOn ?? null,
    repair_warranty_coverage: repair.repairWarranty?.coverage ?? null,
    repair_warranty_provider: repair.repairWarranty?.provider ?? null,
  } satisfies TablesUpdate<"repairs">;
}
