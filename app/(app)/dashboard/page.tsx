import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { PrimaryActions } from "@/components/app-shell/primary-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="The maintenance overview for your household appliances."
        actions={<PrimaryActions />}
      />

      {/* Stages 3–6 replace this with overview cards, appliances and recent repairs. */}
      <EmptyState
        icon={LayoutDashboard}
        title="Your overview is being built"
        description="Appliance counts, active warranties, your appliance list and recent repair activity will appear here."
      />
    </>
  );
}
