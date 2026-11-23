import { connection } from "next/server";
import { ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_CURRENCY, formatDate, formatMoney, pluralize } from "@/lib/format";
import { getReplacementAdvice, type ReplacementVerdict } from "@/lib/replacement-advice";
import type { Appliance, RepairRecord, WarrantyEntry } from "@/lib/types";
import { getApplianceCoverage, toISODate } from "@/lib/warranty";

const CONDITION: Record<ReplacementVerdict, { label: string; tone: "success" | "warning"; text: string }> = {
  repair: {
    label: "Low repair spend for its age",
    tone: "success",
    text: "Repairs so far have been modest and it has plenty of typical life left.",
  },
  watch: {
    label: "Some wear: check recent repairs",
    tone: "warning",
    text: "It's past the middle of its typical life or repairs are adding up. Ask what was fixed and whether it's still under warranty.",
  },
  replace: {
    label: "Near end of life or costly to keep",
    tone: "warning",
    text: "It's past its typical lifespan, or repairs have cost about half a new one. Factor in a replacement soon.",
  },
};

/**
 * The answer a buyer, tenant or technician wants first, before reading the
 * timeline: how old it is, what's been spent, warranty today and an overall
 * read. Uses today's date, so it loads per visit.
 */
export async function SharedSummary({
  appliance,
  repairs,
  warranties,
}: {
  appliance: Appliance;
  /** Newest first. */
  repairs: RepairRecord[];
  warranties: WarrantyEntry[];
}) {
  await connection();
  const today = toISODate(new Date());
  const advice = getReplacementAdvice(appliance.category, appliance.purchaseDate, repairs, today);
  const coverage = getApplianceCoverage(warranties, today);
  const condition = CONDITION[advice.verdict];

  const facts: [string, string][] = [
    ["Age", `${advice.ageYears.toFixed(1)} years (typical life about ${advice.lifespanYears})`],
    [
      "Repairs",
      repairs.length === 0
        ? "None recorded"
        : `${pluralize(repairs.length, "repair")}, ${formatMoney({ amount: advice.spent, currency: DEFAULT_CURRENCY })} in total, last on ${formatDate(repairs[0].repairDate)}`,
    ],
    [
      "Warranty today",
      coverage.kind === "none"
        ? "Not covered"
        : `${coverage.kind === "manufacturer" ? "Manufacturer" : "Repair"} warranty until ${formatDate(coverage.expiresOn)}`,
    ],
  ];

  return (
    <section
      aria-labelledby="summary-heading"
      className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="summary-heading" className="flex items-center gap-2 font-semibold">
          <ClipboardCheck className="size-5 text-brand" aria-hidden="true" />
          Before you buy, rent or book a repair
        </h2>
        <Badge tone={condition.tone}>{condition.label}</Badge>
      </div>
      <p className="text-sm text-pretty text-muted">{condition.text}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-background p-3">
            <dt className="text-muted">{label}</dt>
            <dd className="mt-0.5 font-medium text-pretty">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-pretty text-muted">
        This history was recorded by the owner. RepairPassport doesn&apos;t independently verify
        repairs; ask for the original bills if it matters. Lifespans and prices are typical
        estimates.
      </p>
    </section>
  );
}
