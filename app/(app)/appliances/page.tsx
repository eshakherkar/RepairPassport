import type { Metadata } from "next";
import { Plus, Refrigerator } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Appliances",
};

export default function AppliancesPage() {
  return (
    <>
      <PageHeader
        title="Appliances"
        description="Every household appliance with its own maintenance passport."
        actions={
          <ButtonLink href="/appliances/new">
            <Plus className="size-4" aria-hidden="true" />
            Add appliance
          </ButtonLink>
        }
      />

      {/* Stage 4 replaces this with the appliance list. */}
      <EmptyState
        icon={Refrigerator}
        title="Your appliance list is being built"
        description="Each appliance will appear here with its category, location and warranty status."
      />
    </>
  );
}
