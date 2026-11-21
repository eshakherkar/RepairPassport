"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { buttonClassName } from "@/components/ui/button-styles";
import { loadSampleData, type LoadSampleDataState } from "@/lib/data/sample-data-actions";

const initialState: LoadSampleDataState = {};

/**
 * "Load sample appliances" for empty accounts. A Client Component so it
 * can show "Loading…" while the server copies the samples in.
 */
export function LoadSampleDataButton() {
  const [state, formAction, pending] = useActionState(
    async () => loadSampleData(),
    initialState,
  );

  return (
    <form action={formAction} className="grid justify-items-center gap-2">
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("secondary", "md", "disabled:opacity-70")}
      >
        <Sparkles className="size-4" aria-hidden="true" />
        {pending ? "Loading samples…" : "Load sample appliances"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
