import type { Metadata } from "next";
import { Refrigerator } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Add appliance",
};

export default function AddAppliancePage() {
  return (
    <>
      <PageHeader
        title="Add an appliance"
        description="Create a maintenance passport for a household appliance."
      />

      {/* A later milestone adds the form here. */}
      <EmptyState
        icon={Refrigerator}
        title="The add appliance form is coming soon"
        description="You'll be able to enter the appliance type, brand, model, location, purchase date and warranty details."
        action={
          <ButtonLink href="/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    </>
  );
}
