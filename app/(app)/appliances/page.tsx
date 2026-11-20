import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import {
  ApplianceList,
  ApplianceListSkeleton,
} from "@/components/appliances/appliance-list";
import { ButtonLink } from "@/components/ui/button-link";
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

      <section aria-label="Appliance list">
        {/* Warranty badges use today's date, so the list loads per visit. */}
        <Suspense fallback={<ApplianceListSkeleton count={6} />}>
          <ApplianceList />
        </Suspense>
      </section>
    </>
  );
}
