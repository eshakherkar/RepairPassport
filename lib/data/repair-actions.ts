"use server";

/**
 * Server Actions for repair records.
 *
 * They run as the signed-in user, so Row Level Security applies: the
 * database fills in user_id, and its foreign key only accepts a repair
 * for one of the same user's appliances.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isApplianceId } from "../appliance-validation";
import { requireUser } from "../auth/session";
import {
  parseRepairForm,
  readRepairForm,
  type RepairFieldErrors,
  type RepairFormValues,
} from "../repair-validation";
import { createClient } from "../supabase/server";
import { DEFAULT_CURRENCY } from "../format";
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

/** Postgres error code for "foreign key violation" (no such appliance for this user). */
const FOREIGN_KEY_VIOLATION = "23503";

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
  if (!isApplianceId(applianceId)) {
    return { attempt, values, error: "This appliance doesn’t exist any more." };
  }

  const result = parseRepairForm(values, toISODate(new Date()));
  if (!result.ok) return { attempt, values, fieldErrors: result.fieldErrors };

  const { repair } = result;
  const supabase = await createClient();
  const { error } = await supabase.from("repairs").insert({
    appliance_id: applianceId,
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
    source: "manual",
  });

  if (error) {
    return {
      attempt,
      values,
      error:
        error.code === FOREIGN_KEY_VIOLATION
          ? "This appliance doesn’t exist any more."
          : "Couldn’t save the repair. Please check your connection and try again.",
    };
  }

  // Update the timeline, dashboard totals and warranty counts.
  revalidatePath("/", "layout");
  redirect(`/appliances/${applianceId}`); // Outside try/catch: redirect() works by throwing.
}
