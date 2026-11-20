import type { Metadata } from "next";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";
import { PrimaryActions } from "@/components/app-shell/primary-actions";
import {
  OverviewStats,
  OverviewStatsSkeleton,
} from "@/components/dashboard/overview-stats";
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

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          Overview
        </h2>
        {/* OverviewStats uses today's date, so it loads per visit. */}
        <Suspense fallback={<OverviewStatsSkeleton />}>
          <OverviewStats />
        </Suspense>
      </section>

      {/* Stages 4–6 replace this with the appliance list and recent repairs. */}
      <EmptyState
        icon={LayoutDashboard}
        title="More of your overview is on the way"
        description="Your appliance list and recent repair activity will appear here."
      />
    </>
  );
}
