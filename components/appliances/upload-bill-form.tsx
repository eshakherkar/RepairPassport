"use client";

import { useActionState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { BILL_TYPES } from "@/lib/bill";
import { readBill, type ReadBillState } from "@/lib/data/bill-actions";
import { createRepair } from "@/lib/data/repair-actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { RepairForm } from "./repair-form";

const initialState: ReadBillState = { step: "upload" };

type UploadBillFormProps = {
  appliances: { id: string; name: string }[];
  /** Pre-selected when coming from an appliance's page. */
  defaultApplianceId?: string;
  /** Whether the server can read bills with AI (it needs an API key). */
  aiEnabled: boolean;
};

/**
 * Step 1: choose the appliance and the bill; AI reads it (lib/data/bill-actions.ts).
 * Step 2: check the details in the usual repair form, then save.
 */
export function UploadBillForm({ appliances, defaultApplianceId, aiEnabled }: UploadBillFormProps) {
  const [state, formAction, pending] = useActionState(readBill, initialState);

  if (state.step === "review") return <ReviewBill bill={state} />;

  return (
    <form action={formAction} className="grid max-w-xl gap-5">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

      <SelectField
        id="applianceId"
        name="applianceId"
        label="Which appliance is this bill for?"
        required
        defaultValue={state.applianceId ?? defaultApplianceId ?? ""}
      >
        <option value="" disabled>
          Choose an appliance
        </option>
        {appliances.map((appliance) => (
          <option key={appliance.id} value={appliance.id}>
            {appliance.name}
          </option>
        ))}
      </SelectField>

      <TextField
        id="bill"
        name="bill"
        type="file"
        label="Repair bill or invoice"
        accept={Object.keys(BILL_TYPES).join(",")}
        required
        hint="A photo (JPG, PNG or WebP) or a PDF, up to 4 MB. On a phone you can take a photo."
        className="h-auto w-full min-w-0 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
      />

      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("primary", "md", "w-full sm:w-fit disabled:opacity-70")}
      >
        {aiEnabled ? (
          <>
            <Sparkles className="size-4" aria-hidden="true" />
            {pending ? "Reading your bill… (up to a minute)" : "Upload and read bill"}
          </>
        ) : pending ? (
          "Uploading…"
        ) : (
          "Upload bill"
        )}
      </button>
    </form>
  );
}

/** Step 2: the usual repair form, filled in by AI where it could read the bill. */
function ReviewBill({ bill }: { bill: Extract<ReadBillState, { step: "review" }> }) {
  // Bind the appliance and stored bill to the save action once per upload.
  const saveAction = useMemo(
    () =>
      createRepair.bind(null, bill.applianceId, {
        path: bill.billPath,
        readByAI: bill.values !== null,
      }),
    [bill],
  );

  return (
    <div className="grid gap-6">
      {bill.values ? (
        <FormMessage tone="success">
          AI read your bill and filled in the details below. Check each one against the bill, fix
          anything that&apos;s wrong, then save.
        </FormMessage>
      ) : bill.aiEnabled ? (
        <FormMessage tone="error">
          Your bill is uploaded, but AI couldn&apos;t read it this time. Please type in the details
          below; the bill will be saved with the repair.
        </FormMessage>
      ) : (
        <FormMessage tone="success">
          Your bill is uploaded. Type in the details from the bill below, and it will be saved with
          the repair.
        </FormMessage>
      )}
      <RepairForm
        action={saveAction}
        initialValues={bill.values ?? undefined}
        submitLabel="Save repair"
        cancelHref={`/appliances/${bill.applianceId}`}
      />
    </div>
  );
}
