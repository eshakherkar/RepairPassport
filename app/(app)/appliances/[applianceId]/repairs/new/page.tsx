import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { RepairForm } from "@/components/appliances/repair-form";
import { PageHeader } from "@/components/ui/page-header";
import { getApplianceById } from "@/lib/data/appliances";
import { createRepair } from "@/lib/data/repair-actions";

/*
 * /appliances/[applianceId]/repairs/new: type in a repair by hand.
 * The repair is saved for this appliance and shows in its timeline.
 */

export async function generateMetadata({
  params,
}: PageProps<"/appliances/[applianceId]/repairs/new">): Promise<Metadata> {
  const { applianceId } = await params;
  const appliance = await getApplianceById(applianceId);
  return { title: appliance ? `Log a repair · ${appliance.name}` : "Appliance not found" };
}

export default function NewRepairPage({
  params,
}: PageProps<"/appliances/[applianceId]/repairs/new">) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewRepairContent params={params} />
    </Suspense>
  );
}

async function NewRepairContent({
  params,
}: Pick<PageProps<"/appliances/[applianceId]/repairs/new">, "params">) {
  const { applianceId } = await params;
  const appliance = await getApplianceById(applianceId);
  if (!appliance) notFound();

  const profileHref = `/appliances/${appliance.id}`;

  return (
    <>
      <Link
        href={profileHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to {appliance.name}
      </Link>

      <PageHeader
        title="Log a repair"
        description={`Add a repair or service to the history of your ${appliance.name}.`}
      />

      <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
        <RepairForm
          // The ID is bound here on the server, so the browser can't swap it.
          action={createRepair.bind(null, appliance.id)}
          cancelHref={profileHref}
        />
      </div>
    </>
  );
}

/** Placeholder while the appliance loads. */
function FormSkeleton() {
  return (
    <div className="grid motion-safe:animate-pulse gap-6" aria-hidden="true">
      <div className="h-4 w-40 rounded bg-border" />
      <div className="h-8 w-56 max-w-full rounded bg-border" />
      <div className="h-[32rem] rounded-xl border border-border" />
    </div>
  );
}
