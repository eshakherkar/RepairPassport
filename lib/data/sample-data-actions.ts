"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import { createClient } from "../supabase/server";
import { copySampleData } from "./copy-sample-data";

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

  const error = await copySampleData(supabase);
  if (error) return { error };

  // Show the new data on every page.
  revalidatePath("/", "layout");
  return {};
}
