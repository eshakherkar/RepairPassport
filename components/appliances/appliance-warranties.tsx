import { connection } from "next/server";
import { Panel } from "@/components/ui/panel";
import { formatDate } from "@/lib/format";
import type { WarrantyEntry } from "@/lib/types";
import { getWarrantyStatus, toISODate } from "@/lib/warranty";
import { WarrantyStatusBadge } from "./warranty-badge";

/**
 * Every warranty for one appliance, with its status today.
 * Status depends on today's date, so this waits for a request
 * (`connection()`); the profile page wraps it in <Suspense>.
 */
export async function ApplianceWarranties({
  warranties,
}: {
  warranties: WarrantyEntry[];
}) {
  await connection();
  const today = toISODate(new Date());

  return (
    <Panel title="Warranties">
      {warranties.length === 0 ? (
        <p className="text-sm text-muted">No warranties recorded.</p>
      ) : (
        <ul className="grid gap-4">
          {warranties.map((warranty) => {
            const status = getWarrantyStatus(warranty.expiresOn, today);
            return (
              <li
                key={warranty.repairId ?? "manufacturer"}
                className={status === "expired" ? "opacity-70" : undefined}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {warranty.kind === "manufacturer"
                      ? "Manufacturer warranty"
                      : "Repair warranty"}
                  </p>
                  <WarrantyStatusBadge status={status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {warranty.coverage} · {warranty.provider}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {status === "expired" ? "Ended" : "Valid until"}{" "}
                  {formatDate(warranty.expiresOn)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** Placeholder shown while <ApplianceWarranties> loads. */
export function ApplianceWarrantiesSkeleton() {
  return (
    <Panel title="Warranties">
      <div className="grid animate-pulse gap-4" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-border" />
            <div className="h-3 w-3/4 rounded bg-border" />
          </div>
        ))}
      </div>
    </Panel>
  );
}
