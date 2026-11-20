import { Panel } from "@/components/ui/panel";
import { applianceCategoryLabels } from "@/lib/appliance-categories";
import { formatDate } from "@/lib/format";
import type { Appliance } from "@/lib/types";

/** The appliance's basic facts: type, brand, model, serial number and so on. */
export function ApplianceDetails({ appliance }: { appliance: Appliance }) {
  const rows: [string, string][] = [
    ["Type", applianceCategoryLabels[appliance.category]],
    ["Brand", appliance.brand],
    ["Model", appliance.model],
    ["Serial number", appliance.serialNumber ?? "Not recorded"],
    ["Location", appliance.location],
    ["Purchased", formatDate(appliance.purchaseDate)],
  ];

  return (
    <Panel title="Details">
      <dl className="grid gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-2">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
