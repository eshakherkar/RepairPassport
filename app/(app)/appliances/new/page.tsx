import type { Metadata } from "next";
import { ApplianceForm } from "@/components/appliances/appliance-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Add appliance",
};

/**
 * /appliances/new: the "Add appliance" form.
 * Saving happens in the createAppliance Server Action, which checks the
 * user is signed in and re-checks every answer on the server.
 */
export default function AddAppliancePage() {
  return (
    <>
      <PageHeader
        title="Add an appliance"
        description="Create a maintenance passport for a household appliance."
      />
      <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
        <ApplianceForm />
      </div>
    </>
  );
}
