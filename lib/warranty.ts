import type { ISODate, WarrantyStatus } from "./types";

/** A warranty ending within this many days counts as "expiring soon". */
export const EXPIRING_SOON_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Turns a `Date` into a `YYYY-MM-DD` string using the local calendar day.
 * Pages call this once with "today" and pass the result to the functions
 * below, so every calculation on a page uses the same day.
 */
export function toISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days from `from` to `to` (negative if `to` is in the past). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseISODate(to) - parseISODate(from)) / MS_PER_DAY);
}

/**
 * Works out whether a warranty is active, expiring soon or expired.
 * The expiry date itself still counts as covered.
 */
export function getWarrantyStatus(
  expiresOn: ISODate,
  today: ISODate,
): WarrantyStatus {
  const daysLeft = daysBetween(today, expiresOn);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= EXPIRING_SOON_DAYS) return "expiring-soon";
  return "active";
}

/** True when the warranty still covers the appliance today. */
export function isWarrantyValid(expiresOn: ISODate, today: ISODate): boolean {
  return getWarrantyStatus(expiresOn, today) !== "expired";
}

/** Reads a `YYYY-MM-DD` string as midnight UTC, so day maths ignores time zones. */
function parseISODate(value: ISODate): number {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}
