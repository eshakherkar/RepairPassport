"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { applianceCategoryLabels } from "@/lib/appliance-categories";
import {
  DEFAULT_WARRANTY_COVERAGE,
  SHORT_TEXT_MAX,
  WARRANTY_TEXT_MAX,
  type ApplianceFormValues,
} from "@/lib/appliance-validation";
import { createAppliance, type ApplianceFormState } from "@/lib/data/appliance-actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";

const initialState: ApplianceFormState = { attempt: 0 };

/** Fields in the order they appear, to focus the first one with a problem. */
const FIELD_ORDER: (keyof ApplianceFormValues)[] = [
  "name",
  "category",
  "brand",
  "model",
  "serialNumber",
  "location",
  "purchaseDate",
  "warrantyExpiresOn",
  "warrantyCoverage",
  "warrantyProvider",
];

const LOCATION_SUGGESTIONS = [
  "Kitchen",
  "Living room",
  "Bedroom",
  "Bathroom",
  "Laundry area",
  "Balcony",
  "Utility room",
];

/**
 * The "Add appliance" form. It sends everything to the createAppliance
 * Server Action, which checks it again, saves it and opens the new
 * appliance's profile. If something needs fixing, the form comes back
 * with the user's answers kept and a message under each problem field.
 */
export function ApplianceForm() {
  const [state, formAction, pending] = useActionState(createAppliance, initialState);
  const values = state.values;
  const errors = state.fieldErrors ?? {};
  const firstError = FIELD_ORDER.find((field) => errors[field]);
  const errorCount = Object.keys(errors).length;

  /** Common props for each field: its name, saved value and error. */
  const field = (name: keyof ApplianceFormValues) => ({
    id: name,
    name,
    defaultValue: values?.[name] ?? "",
    error: errors[name],
    autoFocus: name === firstError,
  });

  return (
    // `key` rebuilds the form after each attempt, so every field shows the
    // value the server sent back (React would otherwise clear the form).
    <form key={state.attempt} action={formAction} className="grid gap-8" noValidate>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {errorCount > 0 && (
        <FormMessage tone="error">
          {errorCount === 1
            ? "One answer needs fixing before the appliance can be saved."
            : `${errorCount} answers need fixing before the appliance can be saved.`}
        </FormMessage>
      )}

      <FormSection
        title="About the appliance"
        description="The details a technician would ask for."
      >
        <TextField
          {...field("name")}
          label="Name"
          placeholder="e.g. Kitchen refrigerator"
          hint="A name you’ll recognise, especially if you have two of the same kind."
          required
          maxLength={SHORT_TEXT_MAX}
        />
        <SelectField {...field("category")} label="Type" required>
          <option value="" disabled>
            Choose a type
          </option>
          {Object.entries(applianceCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField
          {...field("brand")}
          label="Brand"
          placeholder="e.g. Samsung"
          required
          maxLength={SHORT_TEXT_MAX}
        />
        <TextField
          {...field("model")}
          label="Model number"
          placeholder="e.g. RT28T3722S8"
          hint="Usually on a sticker inside the door or on the back."
          required
          maxLength={SHORT_TEXT_MAX}
        />
        <TextField
          {...field("serialNumber")}
          label="Serial number (optional)"
          hint="Helps a service centre confirm warranty cover."
          maxLength={SHORT_TEXT_MAX}
        />
      </FormSection>

      <FormSection title="Where and when">
        <TextField
          {...field("location")}
          label="Location in your home"
          placeholder="e.g. Kitchen"
          list="location-suggestions"
          required
          maxLength={SHORT_TEXT_MAX}
        />
        <datalist id="location-suggestions">
          {LOCATION_SUGGESTIONS.map((place) => (
            <option key={place} value={place} />
          ))}
        </datalist>
        <TextField
          {...field("purchaseDate")}
          type="date"
          label="Purchase date"
          hint="An approximate date is fine."
          required
          min="1950-01-01"
        />
      </FormSection>

      <FormSection
        title="Manufacturer warranty (optional)"
        description={`Leave blank if there’s no warranty or you don’t know. If you only add an end date, cover is recorded as “${DEFAULT_WARRANTY_COVERAGE}” from the brand.`}
      >
        <TextField
          {...field("warrantyExpiresOn")}
          type="date"
          label="Warranty ends on"
          min="1950-01-01"
        />
        <TextField
          {...field("warrantyCoverage")}
          label="What it covers"
          placeholder={DEFAULT_WARRANTY_COVERAGE}
          maxLength={WARRANTY_TEXT_MAX}
        />
        <TextField
          {...field("warrantyProvider")}
          label="Provided by"
          placeholder="Usually the brand"
          maxLength={WARRANTY_TEXT_MAX}
        />
      </FormSection>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Link href="/appliances" className={buttonClassName("secondary")}>
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className={buttonClassName("primary", "md", "disabled:opacity-70")}
        >
          {pending ? "Saving…" : "Save appliance"}
        </button>
      </div>
    </form>
  );
}

/** A group of related fields with a heading, laid out in two columns on wider screens. */
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    // role="group" + aria-labelledby: screen readers announce the section
    // title when moving into its fields (like a <fieldset> and <legend>,
    // which can't be laid out in columns reliably).
    <div role="group" aria-labelledby={id} className="grid gap-5 md:grid-cols-3 md:gap-8">
      <div>
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-pretty text-muted">{description}</p>}
      </div>
      <div className="grid content-start gap-4 sm:grid-cols-2 md:col-span-2">{children}</div>
    </div>
  );
}
