import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Shown when an appliance page's ID doesn't match any appliance,
 * e.g. /appliances/old-toaster or a mistyped QR link.
 */
export default function ApplianceNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Appliance not found"
      description="This appliance doesn't exist or may have been removed. Check the link, or find it in your appliance list."
      action={
        <ButtonLink href="/appliances" variant="secondary">
          View all appliances
        </ButtonLink>
      }
    />
  );
}
