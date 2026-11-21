"use server";

import { revalidatePath } from "next/cache";
import { isRecordId } from "../appliance-validation";
import { requireUser } from "../auth/session";
import { createClient } from "../supabase/server";

/**
 * Turns an appliance's public share link on (a new unguessable token) or off.
 * Turning it on again makes a new link, so old QR codes stop working.
 * Row Level Security means users can only change their own appliances.
 */
export async function setSharing(applianceId: string, shared: boolean): Promise<void> {
  await requireUser();
  if (!isRecordId(applianceId)) return;

  const supabase = await createClient();
  await supabase
    .from("appliances")
    .update({ share_token: shared ? crypto.randomUUID() : null })
    .eq("id", applianceId);

  revalidatePath(`/appliances/${applianceId}`);
}
