import { connection } from "next/server";
import { Plus, Refrigerator } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { getApplianceSummaries } from "@/lib/data/appliances";
import { toISODate } from "@/lib/warranty";
import { ApplianceCard } from "./appliance-card";

const gridClasses = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

/**
 * A grid of appliance cards.
 *
 * Warranty badges depend on today's date, so (like the overview cards)
 * this waits for a real request with `connection()`. Wrap it in
 * <Suspense fallback={<ApplianceListSkeleton />}> where it's used.
 */
export async function ApplianceList({ limit }: { limit?: number }) {
  await connection();
  const today = toISODate(new Date());
  const summaries = await getApplianceSummaries(today);

  if (summaries.length === 0) {
    return (
      <EmptyState
        icon={Refrigerator}
        title="No appliances yet"
        description="Add your first household appliance to start its maintenance passport."
        action={
          <ButtonLink href="/appliances/new">
            <Plus className="size-4" aria-hidden="true" />
            Add appliance
          </ButtonLink>
        }
      />
    );
  }

  const shown = limit ? summaries.slice(0, limit) : summaries;

  return (
    <ul className={gridClasses}>
      {shown.map((summary) => (
        <li key={summary.appliance.id}>
          <ApplianceCard summary={summary} />
        </li>
      ))}
    </ul>
  );
}

/** Grey placeholder cards shown while <ApplianceList> loads. */
export function ApplianceListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={gridClasses} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="motion-safe:animate-pulse rounded-xl border border-border bg-background p-5"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-border" />
            </div>
          </div>
          <div className="mt-4 h-5 w-28 rounded-full bg-border" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded bg-border" />
            <div className="h-3 w-1/3 rounded bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}
