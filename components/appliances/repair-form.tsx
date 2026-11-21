"use client";

import { useActionState } from "react";
import type { RepairFormState } from "@/lib/data/repair-actions";
import {
  DEFAULT_REPAIR_WARRANTY_COVERAGE,
  ISSUE_MAX,
  PROVIDER_MAX,
  WARRANTY_TEXT_MAX,
  WORK_DONE_MAX,
  type RepairFormValues,
} from "@/lib/repair-validation";
import { FormActions, FormErrors, FormSection } from "@/components/ui/form-section";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";

const initialState: RepairFormState = { attempt: 0 };

/** Fields in the order they appear, to focus the first one with a problem. */
const FIELD_ORDER: (keyof RepairFormValues)[] = [
  "repairDate",
  "cost",
  "issue",
  "workDone",
  "replacedParts",
  "serviceProvider",
  "warrantyExpiresOn",
  "warrantyCoverage",
  "warrantyProvider",
];

type RepairFormProps = {
  /** createRepair with the appliance's ID already bound (by the page). */
  action: (state: RepairFormState, formData: FormData) => Promise<RepairFormState>;
  /** Where "Cancel" goes: the appliance's profile. */
  cancelHref: string;
};

/**
 * The "Log a repair" form. It sends everything to the createRepair Server
 * Action, which checks it again, saves it and opens the appliance's
 * profile, where the repair appears in the timeline. If something needs
 * fixing, the form comes back with the user's answers kept.
 */
export function RepairForm({ action, cancelHref }: RepairFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values;
  const errors = state.fieldErrors ?? {};
  const firstError = FIELD_ORDER.find((field) => errors[field]);

  /** Common props for each field: its name, saved value and error. */
  const field = (name: keyof RepairFormValues) => ({
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
      <FormErrors
        error={state.error}
        fieldErrorCount={Object.keys(errors).length}
        thing="the repair"
      />

      <FormSection title="The repair" description="What went wrong and what was done.">
        <TextField
          {...field("repairDate")}
          type="date"
          label="Repair date"
          required
          min="1950-01-01"
        />
        <TextField
          {...field("cost")}
          label="Total cost (₹)"
          inputMode="decimal"
          placeholder="e.g. 4850"
          hint="Enter 0 if it was free, for example under warranty."
          required
        />
        <div className="sm:col-span-2">
          <TextField
            {...field("issue")}
            label="Problem"
            placeholder="e.g. Not cooling"
            required
            maxLength={ISSUE_MAX}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            {...field("workDone")}
            label="Work done (optional)"
            placeholder="e.g. Replaced the faulty compressor relay and re-gassed the unit."
            maxLength={WORK_DONE_MAX}
          />
        </div>
      </FormSection>

      <FormSection title="Parts and service">
        <TextAreaField
          {...field("replacedParts")}
          label="Parts replaced (optional)"
          placeholder={"e.g. Door gasket\nDrain pump"}
          hint="One per line, or separated by commas."
          rows={3}
        />
        <TextField
          {...field("serviceProvider")}
          label="Repaired by"
          placeholder="e.g. CoolCare Service Centre"
          hint="The company or service centre."
          required
          maxLength={PROVIDER_MAX}
        />
      </FormSection>

      <FormSection
        title="Repair warranty (optional)"
        description={`Many repairs come with a warranty on the work or parts. If you only add an end date, cover is recorded as “${DEFAULT_REPAIR_WARRANTY_COVERAGE}” from whoever did the repair.`}
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
          placeholder={DEFAULT_REPAIR_WARRANTY_COVERAGE}
          maxLength={WARRANTY_TEXT_MAX}
        />
        <TextField
          {...field("warrantyProvider")}
          label="Provided by"
          placeholder="Usually whoever did the repair"
          maxLength={WARRANTY_TEXT_MAX}
        />
      </FormSection>

      <FormActions cancelHref={cancelHref} submitLabel="Save repair" pending={pending} />
    </form>
  );
}
