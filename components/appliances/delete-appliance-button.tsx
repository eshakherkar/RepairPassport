"use client";

import { useActionState, useId, useRef } from "react";
import { Trash2 } from "lucide-react";
import type { DeleteApplianceState } from "@/lib/data/appliance-actions";
import { pluralize } from "@/lib/format";
import { buttonClassName } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";

type DeleteApplianceButtonProps = {
  /** deleteAppliance with this appliance's ID already bound (by the page). */
  deleteAction: (state: DeleteApplianceState) => Promise<DeleteApplianceState>;
  applianceName: string;
  repairCount: number;
};

/**
 * A "Delete appliance" button that asks for confirmation first.
 *
 * Uses the browser's built-in <dialog>: showModal() keeps keyboard focus
 * inside it, dims the page behind, and Esc closes it. "Cancel" gets focus
 * first (it's the first button inside), so pressing Enter by accident
 * doesn't delete anything.
 */
export function DeleteApplianceButton({
  deleteAction,
  applianceName,
  repairCount,
}: DeleteApplianceButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [state, formAction, pending] = useActionState(deleteAction, {});

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={buttonClassName("danger")}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Delete appliance
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <h2 id={titleId} className="text-lg font-semibold text-pretty">
          Delete {applianceName}?
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-pretty text-muted">
          {repairCount > 0
            ? `This permanently deletes the appliance and its ${pluralize(repairCount, "repair record")}. `
            : "This permanently deletes the appliance. "}
          This can’t be undone.
        </p>

        {state.error && (
          <div className="mt-4">
            <FormMessage tone="error">{state.error}</FormMessage>
          </div>
        )}

        <form
          action={formAction}
          className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
        >
          {/* First in the page order, so showModal() focuses it. */}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={buttonClassName("secondary")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className={buttonClassName("danger", "md", "disabled:opacity-70")}
          >
            {pending ? "Deleting…" : "Delete appliance"}
          </button>
        </form>
      </dialog>
    </>
  );
}
