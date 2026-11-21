import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { RepairForm } from "@/components/appliances/repair-form";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { getRepairForEdit } from "@/lib/data/appliances";
import { deleteRepair, updateRepair } from "@/lib/data/repair-actions";
import { formatDate } from "@/lib/format";
import { toRepairFormValues } from "@/lib/repair-validation";

/*
 * /appliances/[applianceId]/repairs/[repairId]/edit: fix a repair's
 * details, or delete it. A repair that isn't yours, or that belongs to a
 * different appliance, is "not found".
 */

type Props = PageProps<"/appliances/[applianceId]/repairs/[repairId]/edit">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { applianceId, repairId } = await params;
  const found = await getRepairForEdit(applianceId, repairId);
  return { title: found ? `Edit repair · ${found.appliance.name}` : "Repair not found" };
}

export default function EditRepairPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditRepairContent params={params} />
    </Suspense>
  );
}

async function EditRepairContent({ params }: Pick<Props, "params">) {
  const { applianceId, repairId } = await params;
  const found = await getRepairForEdit(applianceId, repairId);
  if (!found) notFound();

  const { appliance, repair } = found;
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
        title="Edit repair"
        description={`${repair.issue} · ${formatDate(repair.repairDate)} · ${appliance.name}`}
      />

      {repair.source === "needs-review" && (
        <FormMessage tone="success">
          AI read this repair from a bill. Check each detail against the bill; saving marks it as
          reviewed.
        </FormMessage>
      )}

      <div className="rounded-xl border border-border bg-background p-5 sm:p-6">
        <RepairForm
          // Both IDs are bound here on the server, so the browser can't swap them.
          action={updateRepair.bind(null, appliance.id, repair.id)}
          initialValues={toRepairFormValues(repair)}
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
            Delete this repair
          </h2>
          <p className="mt-1 text-sm text-pretty text-muted">
            Removes it from the appliance’s history, totals and warranties. The appliance itself
            stays.
          </p>
        </div>
        <ConfirmDeleteButton
          deleteAction={deleteRepair.bind(null, appliance.id, repair.id)}
          label="Delete repair"
          title="Delete this repair?"
          description={`This permanently deletes “${repair.issue}” from ${formatDate(repair.repairDate)} from the history of your ${appliance.name}.`}
        />
      </section>
    </>
  );
}

/** Placeholder while the repair loads. */
function FormSkeleton() {
  return (
    <div className="grid motion-safe:animate-pulse gap-6" aria-hidden="true">
      <div className="h-4 w-40 rounded bg-border" />
      <div className="h-8 w-56 max-w-full rounded bg-border" />
      <div className="h-[32rem] rounded-xl border border-border" />
    </div>
  );
}
