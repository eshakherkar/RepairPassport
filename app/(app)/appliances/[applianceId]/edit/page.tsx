import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ApplianceForm } from "@/components/appliances/appliance-form";
import { DeleteApplianceButton } from "@/components/appliances/delete-appliance-button";
import { PageHeader } from "@/components/ui/page-header";
import { toApplianceFormValues } from "@/lib/appliance-validation";
import { deleteAppliance, updateAppliance } from "@/lib/data/appliance-actions";
import { getApplianceById, getApplianceProfile } from "@/lib/data/appliances";

/*
 * /appliances/[applianceId]/edit: change an appliance's details, or
 * delete it. Like the profile page, the appliance loads per visit for
 * whoever is signed in; someone else's appliance is "not found".
 */

export async function generateMetadata({
  params,
}: PageProps<"/appliances/[applianceId]/edit">): Promise<Metadata> {
  const { applianceId } = await params;
  const appliance = await getApplianceById(applianceId);
  return { title: appliance ? `Edit ${appliance.name}` : "Appliance not found" };
}

export default function EditAppliancePage({
  params,
}: PageProps<"/appliances/[applianceId]/edit">) {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <EditApplianceContent params={params} />
    </Suspense>
  );
}

async function EditApplianceContent({
  params,
}: Pick<PageProps<"/appliances/[applianceId]/edit">, "params">) {
  const { applianceId } = await params;
  const profile = await getApplianceProfile(applianceId);
  if (!profile) notFound();

  const { appliance, repairs } = profile;
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

      <PageHeader title={`Edit ${appliance.name}`} />

      <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
        <ApplianceForm
          // The ID is bound here on the server, so the browser can't swap it.
          action={updateAppliance.bind(null, appliance.id)}
          initialValues={toApplianceFormValues(appliance)}
          submitLabel="Save changes"
          cancelHref={profileHref}
        />
      </div>

      <section
        aria-labelledby="delete-heading"
        className="flex flex-col gap-4 rounded-xl border border-red-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-red-900"
      >
        <div>
          <h2 id="delete-heading" className="font-semibold">
            Delete this appliance
          </h2>
          <p className="mt-1 text-sm text-pretty text-muted">
            Removes the appliance and its whole repair history from your account. This can’t be
            undone.
          </p>
        </div>
        <DeleteApplianceButton
          deleteAction={deleteAppliance.bind(null, appliance.id)}
          applianceName={appliance.name}
          repairCount={repairs.length}
        />
      </section>
    </>
  );
}

/** Placeholder while the appliance loads. */
function EditSkeleton() {
  return (
    <div className="grid motion-safe:animate-pulse gap-6" aria-hidden="true">
      <div className="h-4 w-40 rounded bg-border" />
      <div className="h-8 w-72 max-w-full rounded bg-border" />
      <div className="h-[36rem] rounded-xl border border-border" />
    </div>
  );
}
