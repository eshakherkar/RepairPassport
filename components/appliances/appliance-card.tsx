import Link from "next/link";
import { CalendarDays, MapPin, Wrench } from "lucide-react";
import { applianceCategoryLabels } from "@/lib/appliance-categories";
import { formatDate, pluralize } from "@/lib/format";
import type { ApplianceSummary } from "@/lib/types";
import { ApplianceIcon } from "./appliance-icon";
import { WarrantySummary } from "./warranty-badge";

/**
 * One appliance in a list: what it is, where it is, its warranty cover
 * and its repair activity. The whole card links to the appliance's profile.
 *
 * "Stretched link" pattern: the only real link is the appliance name, and
 * its ::after layer is stretched over the whole card so anywhere is
 * clickable, while screen readers still hear a single, clearly named link.
 */
export function ApplianceCard({ summary }: { summary: ApplianceSummary }) {
  const { appliance, repairCount, lastRepairDate, coverage } = summary;

  return (
    <article className="relative flex h-full flex-col rounded-xl border border-border bg-background p-5 transition-colors hover:border-brand has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand">
      <div className="flex items-start gap-3">
        <ApplianceIcon category={appliance.category} />
        <div className="min-w-0">
          <h3 className="font-semibold text-pretty break-words">
            <Link
              href={`/appliances/${appliance.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl"
            >
              {appliance.name}
            </Link>
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
