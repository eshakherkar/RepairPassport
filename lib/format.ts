import type { CurrencyCode, ISODate, Money } from "./types";

/**
 * App-wide display settings. Change these in one place to switch
 * language/region formatting or the default currency.
 */
export const APP_LOCALE = "en-IN";
export const DEFAULT_CURRENCY: CurrencyCode = "INR";

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-20" → "20 Nov 2026" */
export function formatDate(value: ISODate): string {
  const [year, month, day] = value.split("-").map(Number);
  return dateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

/** { amount: 4850, currency: "INR" } → "₹4,850" */
export function formatMoney(money: Money): string {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: Number.isInteger(money.amount) ? 0 : 2,
  }).format(money.amount);
}

/** 1 → "1 repair", 3 → "3 repairs" */
export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
