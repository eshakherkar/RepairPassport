/**
 * Rules for the "Add appliance" form.
 *
 * The form shows these limits as hints and browser checks, and the Server
 * Action runs `parseApplianceForm` as the real check, because anything in
 * the browser can be bypassed. The database has matching rules too, as a
 * last line of defence.
 */

import { applianceCategoryLabels } from "./appliance-categories";
import type { ApplianceCategory, ISODate } from "./types";
import { daysBetween } from "./warranty";

/** Longest text the database accepts for names, brands, models etc. */
export const SHORT_TEXT_MAX = 100;
/** Longest warranty coverage or provider text the database accepts. */
export const WARRANTY_TEXT_MAX = 200;
/** Used when a warranty end date is given but no coverage is typed. */
export const DEFAULT_WARRANTY_COVERAGE = "Full appliance";

/** Every field on the form, as typed (always strings). */
export type ApplianceFormValues = {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  warrantyExpiresOn: string;
  warrantyCoverage: string;
  warrantyProvider: string;
};

export type ApplianceFieldErrors = Partial<Record<keyof ApplianceFormValues, string>>;

/** A checked appliance, ready to save. */
export type NewAppliance = {
  name: string;
  category: ApplianceCategory;
  brand: string;
  model: string;
  serialNumber: string | null;
  location: string;
  purchaseDate: ISODate;
  manufacturerWarranty: { expiresOn: ISODate; coverage: string; provider: string } | null;
};

export type ParseResult =
  | { ok: true; appliance: NewAppliance }
  | { ok: false; fieldErrors: ApplianceFieldErrors };

/** Reads the form's fields as trimmed strings (missing fields become ""). */
export function readApplianceForm(formData: FormData): ApplianceFormValues {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    name: text("name"),
    category: text("category"),
    brand: text("brand"),
    model: text("model"),
    serialNumber: text("serialNumber"),
    location: text("location"),
    purchaseDate: text("purchaseDate"),
    warrantyExpiresOn: text("warrantyExpiresOn"),
    warrantyCoverage: text("warrantyCoverage"),
    warrantyProvider: text("warrantyProvider"),
  };
}

/**
 * Checks the form. `today` is passed in (rather than read here) so the
 * rules are easy to test.
 */
export function parseApplianceForm(values: ApplianceFormValues, today: ISODate): ParseResult {
  const errors: ApplianceFieldErrors = {};

  requireText(errors, "name", values.name, "Give the appliance a name, like “Kitchen fridge”.");
  if (!isCategory(values.category)) errors.category = "Choose the type of appliance.";
  requireText(errors, "brand", values.brand, "Enter the brand, like Samsung or LG.");
  requireText(errors, "model", values.model, "Enter the model number.");
  requireText(errors, "location", values.location, "Enter where it is, like Kitchen.");
  if (values.serialNumber.length > SHORT_TEXT_MAX) {
    errors.serialNumber = `Use ${SHORT_TEXT_MAX} characters or fewer.`;
  }

  // Purchase date: required, a real date, and not in the future. One day of
  // leeway allows for a server in a different time zone from the user.
  if (!values.purchaseDate) {
    errors.purchaseDate = "Enter the date you bought it.";
  } else if (!isRealDate(values.purchaseDate)) {
    errors.purchaseDate = "Enter a valid date.";
  } else if (daysBetween(today, values.purchaseDate) > 1) {
    errors.purchaseDate = "The purchase date can’t be in the future.";
  } else if (values.purchaseDate < "1950-01-01") {
    errors.purchaseDate = "Enter a date from 1950 onwards.";
  }

  // Manufacturer warranty: optional. If any warranty field is filled in,
  // the end date is required; coverage and provider have sensible defaults.
  const hasWarranty = Boolean(
    values.warrantyExpiresOn || values.warrantyCoverage || values.warrantyProvider,
  );
  if (hasWarranty) {
    if (!values.warrantyExpiresOn) {
      errors.warrantyExpiresOn = "Enter the date the warranty ends, or clear the warranty fields.";
    } else if (!isRealDate(values.warrantyExpiresOn)) {
      errors.warrantyExpiresOn = "Enter a valid date.";
    } else if (
      isRealDate(values.purchaseDate) &&
      values.warrantyExpiresOn < values.purchaseDate
    ) {
      errors.warrantyExpiresOn = "The warranty can’t end before the purchase date.";
    }
    if (values.warrantyCoverage.length > WARRANTY_TEXT_MAX) {
      errors.warrantyCoverage = `Use ${WARRANTY_TEXT_MAX} characters or fewer.`;
    }
    if (values.warrantyProvider.length > WARRANTY_TEXT_MAX) {
      errors.warrantyProvider = `Use ${WARRANTY_TEXT_MAX} characters or fewer.`;
    }
  }

  if (Object.keys(errors).length > 0 || !isCategory(values.category)) {
    return { ok: false, fieldErrors: errors };
  }

  return {
    ok: true,
    appliance: {
      name: values.name,
      category: values.category,
      brand: values.brand,
      model: values.model,
      serialNumber: values.serialNumber || null,
      location: values.location,
      purchaseDate: values.purchaseDate,
      manufacturerWarranty: hasWarranty
        ? {
            expiresOn: values.warrantyExpiresOn,
            coverage: values.warrantyCoverage || DEFAULT_WARRANTY_COVERAGE,
            provider: values.warrantyProvider || values.brand,
          }
        : null,
    },
  };
}

function requireText(
  errors: ApplianceFieldErrors,
  key: keyof ApplianceFormValues,
  value: string,
  emptyMessage: string,
) {
  if (!value) errors[key] = emptyMessage;
  else if (value.length > SHORT_TEXT_MAX) errors[key] = `Use ${SHORT_TEXT_MAX} characters or fewer.`;
}

function isCategory(value: string): value is ApplianceCategory {
  return Object.hasOwn(applianceCategoryLabels, value);
}

/** True for a real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
