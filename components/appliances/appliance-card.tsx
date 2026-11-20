import { CalendarDays, MapPin, Wrench } from "lucide-react";
import { applianceCategoryLabels } from "@/lib/appliance-categories";
import { formatDate, pluralize } from "@/lib/format";
import type { ApplianceSummary } from "@/lib/types";
import { ApplianceIcon } from "./appliance-icon";
import { WarrantySummary } from "./warranty-badge";

/**
 * One appliance in a list: what it is, where it is, its warranty cover
 * and its repair activity.
 * (Stage 5 turns the card into a link to the appliance's profile page.)
 */
export function ApplianceCard({ summary }: { summary: ApplianceSummary }) {
  const { appliance, repairCount, lastRepairDate, coverage } = summary;

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-background p-5">
      <div className="flex items-start gap-3">
        <ApplianceIcon category={appliance.category} />
        <div className="min-w-0">
          <h3 className="font-semibold text-pretty break-words">
            {appliance.name}
          </h3>
          <p className="truncate text-sm text-muted">
            {appliance.brand} · {appliance.model}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <WarrantySummary coverage={coverage} />
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-muted">
        <div className="flex items-center gap-2">
          <dt>
            <MapPin className="size-4" aria-hidden="true" />
            <span className="sr-only">Location and type</span>
          </dt>
          <dd className="truncate">
            {appliance.location} · {applianceCategoryLabels[appliance.category]}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt>
            <Wrench className="size-4" aria-hidden="true" />
            <span className="sr-only">Repairs</span>
          </dt>
          <dd>{repairCount === 0 ? "No repairs yet" : pluralize(repairCount, "repair")}</dd>
        </div>
        {lastRepairDate && (
          <div className="flex items-center gap-2">
            <dt>
              <CalendarDays className="size-4" aria-hidden="true" />
              <span className="sr-only">Last repair</span>
            </dt>
            <dd>Last repaired {formatDate(lastRepairDate)}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
