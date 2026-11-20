import { ShieldCheck, ShieldOff, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { ApplianceCoverage } from "@/lib/types";

/** Shows an appliance's warranty cover at a glance. */
export function WarrantyBadge({ coverage }: { coverage: ApplianceCoverage }) {
  if (coverage.kind === "none") {
    return (
      <Badge>
        <ShieldOff className="size-3.5" aria-hidden="true" />
        No active warranty
      </Badge>
    );
  }

  const label =
    coverage.kind === "manufacturer" ? "Under warranty" : "Repair warranty";

  if (coverage.status === "expiring-soon") {
    return (
      <Badge tone="warning">
        <TriangleAlert className="size-3.5" aria-hidden="true" />
        {label}, ends soon
      </Badge>
    );
  }

  return (
    <Badge tone="success">
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}

/** The badge plus "until 5 Dec 2026", so the end date is always visible. */
export function WarrantySummary({ coverage }: { coverage: ApplianceCoverage }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <WarrantyBadge coverage={coverage} />
      {coverage.kind !== "none" && (
        <span className="text-xs text-muted">
          until {formatDate(coverage.expiresOn)}
        </span>
      )}
    </div>
  );
}
