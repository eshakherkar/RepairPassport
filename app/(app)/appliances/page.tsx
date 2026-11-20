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

      <section aria-labelledby="appliance-list-heading">
        {/* Keeps headings in order (h1 → h2 → card h3) for screen readers. */}
        <h2 id="appliance-list-heading" className="sr-only">
          All appliances
        </h2>
        {/* Warranty badges use today's date, so the list loads per visit. */}
        <Suspense fallback={<ApplianceListSkeleton count={6} />}>
          <ApplianceList />
        </Suspense>
      </section>
    </>
  );
}
