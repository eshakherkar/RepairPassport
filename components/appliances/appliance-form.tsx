"use client";

import { useActionState } from "react";
import { applianceCategoryLabels } from "@/lib/appliance-categories";
import {
  DEFAULT_WARRANTY_COVERAGE,
  SHORT_TEXT_MAX,
  WARRANTY_TEXT_MAX,
  type ApplianceFormValues,
} from "@/lib/appliance-validation";
import type { ApplianceFormState } from "@/lib/data/appliance-actions";
import { FormActions, FormErrors, FormSection } from "@/components/ui/form-section";
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

type ApplianceFormProps = {
  /** The Server Action that checks and saves the answers. */
  action: (state: ApplianceFormState, formData: FormData) => Promise<ApplianceFormState>;
  /** The saved appliance's details, when editing. */
  initialValues?: ApplianceFormValues;
  submitLabel: string;
  /** Where "Cancel" goes. */
  cancelHref: string;
};

/**
 * The form for adding or editing an appliance. It sends everything to a
 * Server Action (createAppliance or updateAppliance), which checks it
 * again, saves it and opens the appliance's profile. If something needs
 * fixing, the form comes back with the user's answers kept and a message
 * under each problem field.
 */
export function ApplianceForm({ action, initialValues, submitLabel, cancelHref }: ApplianceFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values ?? initialValues;
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
      <FormErrors error={state.error} fieldErrorCount={errorCount} thing="the appliance" />

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

      <FormActions cancelHref={cancelHref} submitLabel={submitLabel} pending={pending} />
    </form>
  );
}
