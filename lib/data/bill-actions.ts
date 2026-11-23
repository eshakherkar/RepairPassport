"use server";

import { canReadBills, readBillWithAI } from "../ai/read-bill";
import { isRecordId } from "../appliance-validation";
import { requireUser } from "../auth/session";
import { BILL_TYPES, checkBillFile, type BillMediaType } from "../bill";
import type { RepairFormValues } from "../repair-validation";
import { createClient } from "../supabase/server";

export type ReadBillState =
  | { step: "upload"; error?: string; applianceId?: string }
  | {
      step: "review";
      applianceId: string;
      billPath: string;
      /** Details read by AI; null when the user has to type them in. */
      values: RepairFormValues | null;
      /** False when the server has no Anthropic API key (AI reading is off). */
      aiEnabled: boolean;
    };

/**
 * Step 1 of "Upload repair bill": checks the file, stores it privately in
 * Supabase Storage (in the user's own folder), and asks AI to read it.
 * The user then checks the details in the repair form before anything is
 * added to the appliance's history.
 */
export async function readBill(_previous: ReadBillState, formData: FormData): Promise<ReadBillState> {
  const user = await requireUser();
  const applianceId = String(formData.get("applianceId") ?? "");
  const file = formData.get("bill");

  if (!isRecordId(applianceId)) {
    return { step: "upload", error: "Choose which appliance the bill is for." };
  }
  if (!(file instanceof File)) {
    return { step: "upload", applianceId, error: "Choose a photo or PDF of the bill." };
  }
  const problem = checkBillFile(file);
  if (problem) return { step: "upload", applianceId, error: problem };

  const supabase = await createClient();
  // Row Level Security only returns the user's own appliances.
  const { data: appliance } = await supabase
    .from("appliances")
    .select("id")
    .eq("id", applianceId)
    .maybeSingle();
  if (!appliance) return { step: "upload", error: "That appliance doesn't exist any more." };

  const mediaType = file.type as BillMediaType;
  const billPath = `${user.id}/${crypto.randomUUID()}.${BILL_TYPES[mediaType]}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("bills")
    .upload(billPath, bytes, { contentType: mediaType });
  if (uploadError) {
    return { step: "upload", applianceId, error: "Couldn't upload the bill. Please try again." };
  }

  const aiEnabled = canReadBills();
  const values = aiEnabled ? await readBillWithAI(bytes.toString("base64"), mediaType) : null;
  return { step: "review", applianceId, billPath, values, aiEnabled };
}
