import type { Metadata } from "next";
import { Suspense } from "react";
import { Refrigerator } from "lucide-react";
import { UploadBillForm } from "@/components/appliances/upload-bill-form";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { canReadBills } from "@/lib/ai/read-bill";
import { getAppliances } from "@/lib/data/appliances";

export const metadata: Metadata = {
  title: "Upload repair bill",
};

/** /repairs/upload, or /repairs/upload?appliance=<id> from an appliance's page. */
export default function UploadRepairBillPage({ searchParams }: PageProps<"/repairs/upload">) {
  return (
    <>
      <PageHeader
        title="Upload a repair bill"
        description={
          canReadBills()
            ? "AI reads the date, problem, cost, parts and warranty from your bill. You check the details, then they're added to the appliance's history with the bill attached."
            : "Upload a photo or PDF of the bill and type in its details. The bill is saved with the repair, so it's always with the appliance's history."
        }
      />
      <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
        {/* The appliance list belongs to whoever is signed in, so it loads per visit. */}
        <Suspense fallback={<div className="h-48 motion-safe:animate-pulse rounded-lg bg-surface" />}>
          <UploadBillContent searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function UploadBillContent({ searchParams }: Pick<PageProps<"/repairs/upload">, "searchParams">) {
  const [{ appliance }, appliances] = await Promise.all([searchParams, getAppliances()]);

  if (appliances.length === 0) {
    return (
      <EmptyState
        icon={Refrigerator}
        title="Add an appliance first"
        description="Bills are saved to an appliance's history, so add the appliance the bill is for."
        action={<ButtonLink href="/appliances/new">Add appliance</ButtonLink>}
      />
    );
  }

  return (
    <UploadBillForm
      appliances={appliances.map(({ id, name }) => ({ id, name }))}
      defaultApplianceId={typeof appliance === "string" ? appliance : undefined}
      aiEnabled={canReadBills()}
    />
  );
}
