import Link from "next/link";
import {
  Building2,
  FileText,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Upload,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { DEFAULT_CURRENCY, formatDate, formatMoney, pluralize } from "@/lib/format";
import type { RepairRecord } from "@/lib/types";
import { RecordSourceBadge } from "./record-source-badge";

/**
 * An appliance's repairs in date order, newest at the top, with what was
 * wrong, what was done, the cost, parts and any repair warranty.
 * `readOnly` (the public share page) hides editing, bills and buttons.
 */
export function RepairTimeline({
  applianceId,
  repairs,
  readOnly = false,
}: {
  applianceId: string;
  repairs: RepairRecord[];
  readOnly?: boolean;
}) {
  if (repairs.length === 0) {
    return (
      <Panel title="Repair history">
        <EmptyState
          icon={Wrench}
          title="No repairs recorded yet"
          description={
            readOnly
              ? "This appliance has no repairs on record."
              : "When this appliance is repaired or serviced, log the repair or upload its bill to start its history."
          }
          action={
            !readOnly && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <ButtonLink href={`/appliances/${applianceId}/repairs/new`}>
                  <Plus className="size-4" aria-hidden="true" />
                  Log a repair
                </ButtonLink>
                <ButtonLink href={`/repairs/upload?appliance=${applianceId}`} variant="secondary">
                  <Upload className="size-4" aria-hidden="true" />
                  Upload repair bill
                </ButtonLink>
              </div>
            )
          }
        />
      </Panel>
    );
  }

  const totalCost = repairs.reduce((sum, r) => sum + r.cost.amount, 0);

  return (
    <Panel
      title="Repair history"
      aside={
        <p className="text-sm text-muted">
          {pluralize(repairs.length, "repair")} ·{" "}
          {formatMoney({ amount: totalCost, currency: DEFAULT_CURRENCY })} total
        </p>
      }
    >
      <ol className="relative grid gap-8 border-l border-border pl-6">
        {repairs.map((repair) => (
          <li
            key={repair.id}
            // The id lets other pages link straight to this repair,
            // e.g. /appliances/<appliance id>#<repair id>.
            // scroll-mt leaves room for the sticky phone header when the
            // page scrolls to it.
            id={repair.id}
            className="relative scroll-mt-32 lg:scroll-mt-8"
          >
            {/* The dot on the timeline line */}
            <span
              className="absolute top-1.5 -left-[29px] size-2.5 rounded-full bg-brand ring-4 ring-background"
              aria-hidden="true"
            />

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <time dateTime={repair.repairDate} className="text-sm text-muted">
                {formatDate(repair.repairDate)}
              </time>
              <RecordSourceBadge source={repair.source} />
              {!readOnly && (
                <div className="ml-auto flex items-center gap-4">
                  {repair.billPath && (
                    <a
                      href={`/appliances/${applianceId}/repairs/${repair.id}/bill`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View bill (opens in a new tab): ${repair.issue}, ${formatDate(repair.repairDate)}`}
                      className="inline-flex items-center gap-1 rounded text-sm font-medium text-brand hover:text-brand-hover"
                    >
                      <FileText className="size-3.5" aria-hidden="true" />
                      Bill
                    </a>
                  )}
                  <Link
                    href={`/appliances/${applianceId}/repairs/${repair.id}/edit`}
                    // The visible text is short; screen readers hear which repair.
                    aria-label={`${repair.source === "needs-review" ? "Review" : "Edit"} repair: ${repair.issue}, ${formatDate(repair.repairDate)}`}
                    className="inline-flex items-center gap-1 rounded text-sm font-medium text-brand hover:text-brand-hover"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {repair.source === "needs-review" ? "Review" : "Edit"}
                  </Link>
                </div>
              )}
            </div>

            <h3 className="mt-1 font-semibold">{repair.issue}</h3>
            {repair.workDone && (
              <p className="mt-1 text-sm leading-6 text-pretty">{repair.workDone}</p>
            )}

            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Cost</dt>
                <dd className="font-medium">
                  {repair.cost.amount === 0 ? "No charge" : formatMoney(repair.cost)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted">
                  <Building2 className="size-3.5" aria-hidden="true" />
                  Service provider
                </dt>
                <dd className="font-medium">{repair.serviceProvider}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted">
                  <Package className="size-3.5" aria-hidden="true" />
                  Parts replaced
                </dt>
                <dd className="font-medium">
                  {repair.replacedParts.length === 0 ? "None" : repair.replacedParts.join(", ")}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  Repair warranty
                </dt>
                <dd className="font-medium">
                  {repair.repairWarranty
                    ? `${repair.repairWarranty.coverage}, until ${formatDate(repair.repairWarranty.expiresOn)}`
                    : "None"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
