import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";

/** Shown for a mistyped share link, or one the owner has stopped sharing. */
export default function SharedApplianceNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={SearchX}
        title="This share link doesn't work"
        description="The owner may have stopped sharing this appliance, or the link was copied incompletely. Ask them for a new link or QR code."
        action={<ButtonLink href="/">About RepairPassport</ButtonLink>}
      />
    </div>
  );
}
