import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { DEFAULT_CURRENCY, formatMoney } from "@/lib/format";
import { getReplacementAdvice, type ReplacementVerdict } from "@/lib/replacement-advice";
import type { Appliance, RepairRecord } from "@/lib/types";
import { toISODate } from "@/lib/warranty";

const VERDICTS: Record<
  ReplacementVerdict,
  { label: string; tone: "success" | "warning" | "neutral"; text: string }
> = {
  repair: {
    label: "Worth repairing",
    tone: "success",
    text: "Repairs have cost little so far and it has plenty of life left.",
  },
  watch: {
    label: "Keep an eye on it",
    tone: "warning",
    text: "It's getting older or costlier to keep running. Weigh the next big repair against buying new.",
  },
  replace: {
    label: "Consider replacing",
    tone: "warning",
    text: "Repairs have cost half a new one, or it's past its usual lifespan. A new, more efficient model may be better value.",
  },
};

/**
 * "Repair or replace?": total repair costs and age against a typical new
 * price and lifespan. Depends on today's date, so it loads per visit
 * (the profile page wraps it in <Suspense>).
 */
export async function ReplacementAdvicePanel({
  appliance,
  repairs,
}: {
  appliance: Appliance;
  repairs: RepairRecord[];
}) {
  await connection();
  const advice = getReplacementAdvice(
    appliance.category,
    appliance.purchaseDate,
    repairs,
    toISODate(new Date()),
  );
  const verdict = VERDICTS[advice.verdict];
  const money = (amount: number) => formatMoney({ amount, currency: DEFAULT_CURRENCY });

  return (
    <Panel title="Repair or replace?">
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Badge tone={verdict.tone}>{verdict.label}</Badge>
          <p className="text-sm text-pretty text-muted">{verdict.text}</p>
        </div>
        <Meter
          label="Spent on repairs"
          value={`${money(advice.spent)} of about ${money(advice.typicalPrice)} for a new one`}
          share={advice.spentShare}
        />
        <Meter
          label="Age"
          value={`${advice.ageYears.toFixed(1)} of about ${advice.lifespanYears} years`}
          share={advice.ageYears / advice.lifespanYears}
        />
        <p className="text-xs text-muted">Based on typical prices and lifespans; your model may differ.</p>
      </div>
    </Panel>
  );
}

/** A labelled bar; the text carries the meaning, the bar is decoration. */
function Meter({ label, value, share }: { label: string; value: string; share: number }) {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex flex-wrap justify-between gap-x-2">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div
          className={`h-full rounded-full ${share >= 0.5 ? "bg-warning" : "bg-brand"}`}
          style={{ width: `${Math.min(100, Math.round(share * 100))}%` }}
        />
      </div>
    </div>
  );
}
