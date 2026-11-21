import { connection } from "next/server";
import { isRecordId } from "../appliance-validation";
import type { Tables } from "../supabase/database.types";
import { createClient } from "../supabase/server";
import type { ApplianceProfile } from "../types";
import { buildProfile } from "./derive";
import { toAppliance, toRepair } from "./mappers";

/**
 * The public, read-only history behind a share link, or undefined if the
 * link is wrong or sharing was stopped. Works for signed-out visitors: the
 * database function get_shared_appliance only returns the matching appliance,
 * without the owner, serial number or bill files.
 */
export async function getSharedProfile(token: string): Promise<ApplianceProfile | undefined> {
  if (!isRecordId(token)) return undefined;

  // Load per visit: the Supabase client reads the clock, which Next.js
  // doesn't allow while pre-building pages (same as lib/auth/session.ts).
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_appliance", { p_token: token });
  if (error) throw new Error(`Couldn't load the shared appliance (${error.code}).`);
  if (!data) return undefined;

  // The function removes private columns; fill them as empty so the usual mappers apply.
  const shared = data as {
    appliance: Omit<Tables<"appliances">, "user_id" | "share_token" | "serial_number">;
    repairs: Omit<Tables<"repairs">, "user_id" | "bill_path">[];
  };
  const appliance = toAppliance({
    ...shared.appliance,
    user_id: "",
    share_token: null,
    serial_number: null,
  });
  const repairs = shared.repairs.map((r) => toRepair({ ...r, user_id: "", bill_path: null }));
  return buildProfile([appliance], repairs, appliance.id);
}
