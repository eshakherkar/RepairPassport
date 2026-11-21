"use client";

import { useActionState, useId, useRef } from "react";
import { Trash2 } from "lucide-react";
import { buttonClassName, type ButtonSize } from "./button-styles";
import { FormMessage } from "./form-message";

type DeleteState = { error?: string };

type ConfirmDeleteButtonProps = {
  /** The delete Server Action, with the record's ID(s) already bound by the page. */
  deleteAction: (state: DeleteState) => Promise<DeleteState>;
  /** Text on both the button and the pop-up's confirm button, e.g. "Delete appliance". */
  label: string;
  /** The pop-up's question, e.g. "Delete Kitchen fridge?" */
  title: string;
  /** What will be lost. "This can't be undone." is added after it. */
  description: string;
  size?: ButtonSize;
};

/**
 * A red delete button that asks for confirmation first.
 *
 * Uses the browser's built-in <dialog>: showModal() keeps keyboard focus
 * inside it, dims the page behind, and Esc closes it. "Cancel" gets focus
 * first (it's the first button inside), so pressing Enter by accident
 * doesn't delete anything.
 */
export function ConfirmDeleteButton({
  deleteAction,
  label,
  title,
  description,
  size = "md",
}: ConfirmDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [state, formAction, pending] = useActionState(deleteAction, {});

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={buttonClassName("danger", size)}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <h2 id={titleId} className="text-lg font-semibold text-pretty">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-pretty text-muted">
          {description} This can’t be undone.
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
            {pending ? "Deleting…" : label}
          </button>
        </form>
      </dialog>
    </>
  );
}
