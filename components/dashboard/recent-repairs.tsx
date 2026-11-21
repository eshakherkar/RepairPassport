import Link from "next/link";
import { ChevronRight, Upload, Wrench } from "lucide-react";
import { ApplianceIcon } from "@/components/appliances/appliance-icon";
import { RecordSourceBadge } from "@/components/appliances/record-source-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { getRecentRepairs } from "@/lib/data/appliances";
import { formatDate, formatMoney } from "@/lib/format";

/**
 * The latest repairs across all appliances, newest first.
 * Each row links to that repair in the appliance's timeline.
 *
 * The repairs belong to the signed-in user and come from the database,
 * so this loads per visit: wrap it in <Suspense fallback={<RecentRepairsSkeleton />}>.
 */
export async function RecentRepairs({ limit = 5 }: { limit?: number }) {
  const repairs = await getRecentRepairs(limit);

  if (repairs.length === 0) {
    return (
      <Panel title="Recent repair activity">
        <EmptyState
          icon={Wrench}
          title="No repairs recorded yet"
          description="Upload a repair bill and it will show up here."
          action={
            <ButtonLink href="/repairs/upload" variant="secondary">
              <Upload className="size-4" aria-hidden="true" />
              Upload repair bill
            </ButtonLink>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel title="Recent repair activity">
      <ul className="-my-3 divide-y divide-border">
        {repairs.map((repair) => (
          <li
            key={repair.id}
            className="relative flex items-center gap-4 py-3"
          >
            <ApplianceIcon category={repair.appliance.category} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* Stretched link: the whole row is clickable. */}
                <Link
                  href={`/appliances/${repair.appliance.id}#${repair.id}`}
                  className="font-medium outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-brand"
                >
                  {repair.issue}
                </Link>
                {repair.source === "needs-review" && (
                  <RecordSourceBadge source={repair.source} />
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {repair.appliance.name} ·{" "}
                <time dateTime={repair.repairDate}>
                  {formatDate(repair.repairDate)}
                </time>
              </p>
            </div>

            <p className="shrink-0 text-right text-sm font-medium">
              {repair.cost.amount === 0 ? "No charge" : formatMoney(repair.cost)}
            </p>
            <ChevronRight
              className="hidden size-4 shrink-0 text-muted sm:block"
              aria-hidden="true"
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Placeholder rows shown while recent repairs load. */
export function RecentRepairsSkeleton() {
  return (
    <Panel title="Recent repair activity">
      <ul className="-my-3 divide-y divide-border motion-safe:animate-pulse" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-4 py-3">
            <div className="size-10 shrink-0 rounded-lg bg-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-border" />
            </div>
            <div className="h-4 w-14 rounded bg-border" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
