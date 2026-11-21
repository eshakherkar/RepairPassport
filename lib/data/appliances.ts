import { cache } from "react";
import { isRecordId } from "../appliance-validation";
import { requireUser } from "../auth/session";
import { createClient } from "../supabase/server";
import type {
  Appliance,
  ApplianceProfile,
  ApplianceSummary,
  DashboardStats,
  ISODate,
  RepairRecord,
  RepairWithAppliance,
} from "../types";
import {
  buildProfile,
  dashboardStats,
  recentRepairs,
  sortByName,
  summarizeAppliances,
} from "./derive";
import { toAppliance, toRepair } from "./mappers";

/*
 * DATA ACCESS LAYER
 * -----------------
 * Every page gets appliance and repair data through these functions.
 * They read the SIGNED-IN USER'S rows from Supabase.
 *
 * Security, in two layers:
 *  1. requireUser() checks the session first (signed-out → /sign-in).
 *  2. Row Level Security in the database only ever returns this user's
 *     rows, even if a query forgot to filter.
 *
 * Each list is fetched once per request (React `cache`), so a page that
 * shows stats, cards and recent repairs still makes only two queries.
 * Household data is small, so the calculations run in derive.ts.
 */

const fetchAppliances = cache(async (): Promise<Appliance[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("appliances").select("*");
  if (error) throw new Error(`Couldn't load appliances (${error.code}).`);
  return data.map(toAppliance);
});

const fetchRepairs = cache(async (): Promise<RepairRecord[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("repairs").select("*");
  if (error) throw new Error(`Couldn't load repairs (${error.code}).`);
  return data.map(toRepair);
});

/** All of the user's appliances, sorted by name. */
export async function getAppliances(): Promise<Appliance[]> {
  return sortByName(await fetchAppliances());
}

/** One appliance by its ID, or `undefined` if it doesn't exist (or isn't yours). */
export async function getApplianceById(applianceId: string): Promise<Appliance | undefined> {
  if (!isRecordId(applianceId)) return undefined;
  return (await fetchAppliances()).find((a) => a.id === applianceId);
}

/** The most recent repairs across all appliances, with appliance details. */
export async function getRecentRepairs(limit = 5): Promise<RepairWithAppliance[]> {
  const [appliances, repairs] = await Promise.all([fetchAppliances(), fetchRepairs()]);
  return recentRepairs(appliances, repairs, limit);
}

/** Each appliance with its repair count, last repair and warranty cover on `today`. */
export async function getApplianceSummaries(today: ISODate): Promise<ApplianceSummary[]> {
  const [appliances, repairs] = await Promise.all([fetchAppliances(), fetchRepairs()]);
  return summarizeAppliances(appliances, repairs, today);
}

/** Everything for one appliance's profile page, or `undefined` → "Appliance not found". */
export async function getApplianceProfile(
  applianceId: string,
): Promise<ApplianceProfile | undefined> {
  if (!isRecordId(applianceId)) return undefined;
  const [appliances, repairs] = await Promise.all([fetchAppliances(), fetchRepairs()]);
  return buildProfile(appliances, repairs, applianceId);
}

/**
 * One repair and its appliance, for the edit-repair page, or `undefined`
 * if either doesn't exist, isn't yours, or the repair belongs to a
 * different appliance.
 */
export async function getRepairForEdit(
  applianceId: string,
  repairId: string,
): Promise<{ appliance: Appliance; repair: RepairRecord } | undefined> {
  if (!isRecordId(applianceId) || !isRecordId(repairId)) return undefined;
  const [appliances, repairs] = await Promise.all([fetchAppliances(), fetchRepairs()]);
  const appliance = appliances.find((a) => a.id === applianceId);
  const repair = repairs.find((r) => r.id === repairId && r.applianceId === applianceId);
  return appliance && repair ? { appliance, repair } : undefined;
}

/**
 * Numbers for the dashboard's overview cards.
 * `today` is passed in so a page decides what "today" is once.
 */
export async function getDashboardStats(today: ISODate): Promise<DashboardStats> {
  const [appliances, repairs] = await Promise.all([fetchAppliances(), fetchRepairs()]);
  return dashboardStats(appliances, repairs, today);
}
