import { Info } from "lucide-react";

/**
 * Makes it clear the dashboard shows made-up data while there is no
 * database. Remove it once real user data is connected.
 */
export function SampleDataNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
      <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      You&apos;re viewing fictional sample appliances and repairs. Real
      accounts and data are coming later.
    </p>
  );
}
