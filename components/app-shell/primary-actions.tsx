import { Plus, Upload } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

/** The two main actions in RepairPassport, used in page headers. */
export function PrimaryActions() {
  return (
    <>
      <ButtonLink href="/repairs/upload" variant="secondary">
        <Upload className="size-4" aria-hidden="true" />
        Upload repair bill
      </ButtonLink>
      <ButtonLink href="/appliances/new">
        <Plus className="size-4" aria-hidden="true" />
        Add appliance
      </ButtonLink>
    </>
  );
}
