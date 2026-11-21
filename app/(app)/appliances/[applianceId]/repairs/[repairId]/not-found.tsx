import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown when a repair link doesn't match one of your repairs (e.g. it was deleted). */
export default function RepairNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Repair not found"
      description="This repair doesn't exist or may have been deleted. Find it in the appliance's repair history."
      action={
        <ButtonLink href="/appliances" variant="secondary">
          View all appliances
        </ButtonLink>
      }
    />
  );
}
