import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import {
  ApplianceList,
  ApplianceListSkeleton,
} from "@/components/appliances/appliance-list";
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

/** How many appliance cards the dashboard previews ("View all" shows the rest). */
const DASHBOARD_APPLIANCE_LIMIT = 3;

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

      <section aria-labelledby="appliances-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="appliances-heading" className="text-lg font-semibold">
            Your appliances
          </h2>
          <Link
            href="/appliances"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <Suspense fallback={<ApplianceListSkeleton count={DASHBOARD_APPLIANCE_LIMIT} />}>
          <ApplianceList limit={DASHBOARD_APPLIANCE_LIMIT} />
        </Suspense>
      </section>

      {/* Stage 6 replaces this with recent repair activity. */}
      <EmptyState
        icon={LayoutDashboard}
        title="Recent repair activity is on the way"
        description="The latest repairs across all your appliances will appear here."
      />
    </>
  );
}
