/**
 * Rules for the "Log a repair" form.
 *
 * The form shows these limits as hints and browser checks, and the Server
 * Action runs `parseRepairForm` as the real check, because anything in the
 * browser can be bypassed. The database has matching rules too.
 *
 * Later, bills read by AI will fill in this same form for the user to
 * review, so these rules will check AI-extracted repairs as well.
 */

import { isRealDate } from "./appliance-validation";
import type { ISODate, RepairRecord } from "./types";
import { daysBetween } from "./warranty";

export const ISSUE_MAX = 200;
export const WORK_DONE_MAX = 2000;
export const PROVIDER_MAX = 200;
export const WARRANTY_TEXT_MAX = 200;
export const PART_MAX = 100;
export const PARTS_MAX_COUNT = 20;
/** The database stores up to 10 digits of rupees plus paise. */
export const COST_MAX = 9_999_999_999.99;
/** Used when a repair warranty end date is given but no coverage is typed. */
export const DEFAULT_REPAIR_WARRANTY_COVERAGE = "Repair work and parts";

/** Every field on the form, as typed (always strings). */
export type RepairFormValues = {
  repairDate: string;
  issue: string;
  workDone: string;
  cost: string;
  replacedParts: string;
  serviceProvider: string;
  warrantyExpiresOn: string;
  warrantyCoverage: string;
  warrantyProvider: string;
};

export type RepairFieldErrors = Partial<Record<keyof RepairFormValues, string>>;

/** A checked repair, ready to save. */
export type NewRepair = {
  repairDate: ISODate;
  issue: string;
  workDone: string;
  /** Rupees, e.g. 4850.5 */
  cost: number;
  replacedParts: string[];
  serviceProvider: string;
  repairWarranty: { expiresOn: ISODate; coverage: string; provider: string } | null;
};

export type RepairParseResult =
  | { ok: true; repair: NewRepair }
  | { ok: false; fieldErrors: RepairFieldErrors };

/** A saved repair as form values, to fill in the edit form. */
export function toRepairFormValues(repair: RepairRecord): RepairFormValues {
  return {
    repairDate: repair.repairDate,
    issue: repair.issue,
    workDone: repair.workDone,
    // 4850 → "4850", 4850.5 → "4850.50"
    cost: Number.isInteger(repair.cost.amount)
      ? String(repair.cost.amount)
      : repair.cost.amount.toFixed(2),
    // One part per line, as the form's hint suggests.
    replacedParts: repair.replacedParts.join("\n"),
    serviceProvider: repair.serviceProvider,
    warrantyExpiresOn: repair.repairWarranty?.expiresOn ?? "",
    warrantyCoverage: repair.repairWarranty?.coverage ?? "",
    warrantyProvider: repair.repairWarranty?.provider ?? "",
  };
}

/** Reads the form's fields as trimmed strings (missing fields become ""). */
export function readRepairForm(formData: FormData): RepairFormValues {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    repairDate: text("repairDate"),
    issue: text("issue"),
    workDone: text("workDone"),
    cost: text("cost"),
    replacedParts: text("replacedParts"),
    serviceProvider: text("serviceProvider"),
    warrantyExpiresOn: text("warrantyExpiresOn"),
    warrantyCoverage: text("warrantyCoverage"),
    warrantyProvider: text("warrantyProvider"),
  };
}

/**
 * Checks the form. `today` is passed in (rather than read here) so the
 * rules are easy to test.
 */
export function parseRepairForm(values: RepairFormValues, today: ISODate): RepairParseResult {
  const errors: RepairFieldErrors = {};

  // Repair date: required, real, not in the future (one day of leeway for
  // a server in a different time zone from the user).
  if (!values.repairDate) {
    errors.repairDate = "Enter the date of the repair.";
  } else if (!isRealDate(values.repairDate)) {
    errors.repairDate = "Enter a valid date.";
  } else if (daysBetween(today, values.repairDate) > 1) {
    errors.repairDate = "The repair date can’t be in the future.";
  } else if (values.repairDate < "1950-01-01") {
    errors.repairDate = "Enter a date from 1950 onwards.";
  }

  if (!values.issue) errors.issue = "Describe the problem in a few words, like “Not cooling”.";
  else if (values.issue.length > ISSUE_MAX) errors.issue = `Use ${ISSUE_MAX} characters or fewer.`;

  if (values.workDone.length > WORK_DONE_MAX) {
    errors.workDone = `Use ${WORK_DONE_MAX} characters or fewer.`;
  }

  const cost = parseRupees(values.cost);
  if (!values.cost) errors.cost = "Enter the total cost.";
  else if (cost === null) errors.cost = "Enter an amount in rupees, like 4850 or 4850.50.";
  else if (cost > COST_MAX) errors.cost = "That amount is too large.";

  const parts = splitParts(values.replacedParts);
  if (parts.length > PARTS_MAX_COUNT) {
    errors.replacedParts = `List up to ${PARTS_MAX_COUNT} parts.`;
  } else if (parts.some((part) => part.length > PART_MAX)) {
    errors.replacedParts = `Keep each part to ${PART_MAX} characters or fewer.`;
  }

  if (!values.serviceProvider) {
    errors.serviceProvider = "Enter who did the repair, like the service centre’s name.";
  } else if (values.serviceProvider.length > PROVIDER_MAX) {
    errors.serviceProvider = `Use ${PROVIDER_MAX} characters or fewer.`;
  }

  // Repair warranty: optional. If any warranty field is filled in, the end
  // date is required; coverage and provider have sensible defaults.
  const hasWarranty = Boolean(
    values.warrantyExpiresOn || values.warrantyCoverage || values.warrantyProvider,
  );
  if (hasWarranty) {
    if (!values.warrantyExpiresOn) {
      errors.warrantyExpiresOn = "Enter the date the warranty ends, or clear the warranty fields.";
    } else if (!isRealDate(values.warrantyExpiresOn)) {
      errors.warrantyExpiresOn = "Enter a valid date.";
    } else if (isRealDate(values.repairDate) && values.warrantyExpiresOn < values.repairDate) {
      errors.warrantyExpiresOn = "The warranty can’t end before the repair date.";
    }
    if (values.warrantyCoverage.length > WARRANTY_TEXT_MAX) {
      errors.warrantyCoverage = `Use ${WARRANTY_TEXT_MAX} characters or fewer.`;
    }
    if (values.warrantyProvider.length > WARRANTY_TEXT_MAX) {
      errors.warrantyProvider = `Use ${WARRANTY_TEXT_MAX} characters or fewer.`;
    }
  }

  if (Object.keys(errors).length > 0 || cost === null) {
    return { ok: false, fieldErrors: errors };
  }

  return {
    ok: true,
    repair: {
      repairDate: values.repairDate,
      issue: values.issue,
      workDone: values.workDone,
      cost,
      replacedParts: parts,
      serviceProvider: values.serviceProvider,
      repairWarranty: hasWarranty
        ? {
            expiresOn: values.warrantyExpiresOn,
            coverage: values.warrantyCoverage || DEFAULT_REPAIR_WARRANTY_COVERAGE,
            provider: values.warrantyProvider || values.serviceProvider,
          }
        : null,
    },
  };
}

/**
 * "₹4,850.50", "Rs. 4850" or "4850" → 4850.5. Returns null if it isn't
 * a plain amount with at most two decimal places.
 */
export function parseRupees(value: string): number | null {
  const cleaned = value.replace(/^(₹|rs\.?|inr)\s*/i, "").replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** Parts typed one per line or separated by commas, without blanks or repeats. */
export function splitParts(value: string): string[] {
  const parts = value
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}
