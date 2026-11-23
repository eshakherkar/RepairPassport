import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Pencil, Plus, Printer, Upload } from "lucide-react";
import { ApplianceDetails } from "@/components/appliances/appliance-details";
import { ApplianceIcon } from "@/components/appliances/appliance-icon";
import {
  ApplianceWarranties,
  ApplianceWarrantiesSkeleton,
} from "@/components/appliances/appliance-warranties";
import { RepairTimeline } from "@/components/appliances/repair-timeline";
import { ReplacementAdvicePanel } from "@/components/appliances/replacement-advice-panel";
import { SharePanel } from "@/components/appliances/share-panel";
import { ButtonLink } from "@/components/ui/button-link";
import { getApplianceById, getApplianceProfile } from "@/lib/data/appliances";

/*
 * /appliances/[applianceId], e.g. /appliances/3f9a0c1e-…
 *
 * The [applianceId] folder name makes this a dynamic route: one page file
 * serves every appliance. This is also the address a QR code will point to.
 *
 * Appliances are private to each user, so nothing is pre-built per
 * appliance (no generateStaticParams): the page frame is pre-built, and
 * the appliance itself loads per visit for whoever is signed in.
 */

/** Sets the browser tab title to the appliance's name. */
export async function generateMetadata({
  params,
}: PageProps<"/appliances/[applianceId]">): Promise<Metadata> {
  const { applianceId } = await params;
  const appliance = await getApplianceById(applianceId);
  return { title: appliance?.name ?? "Appliance not found" };
}

export default function AppliancePage({
  params,
}: PageProps<"/appliances/[applianceId]">) {
  return (
    <>
      <Link
        href="/appliances"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All appliances
      </Link>

      {/*
        Next.js 16 guidance: read `params` inside <Suspense>, not at the top
        of the page, so the page frame can be shown instantly even for an
        appliance that wasn't pre-built.
      */}
      <Suspense fallback={<ProfileSkeleton />}>
        <ApplianceProfileContent params={params} />
      </Suspense>
    </>
  );
}

async function ApplianceProfileContent({
  params,
}: Pick<PageProps<"/appliances/[applianceId]">, "params">) {
  const { applianceId } = await params;
  const profile = await getApplianceProfile(applianceId);

  // Shows app/(app)/appliances/[applianceId]/not-found.tsx
  if (!profile) notFound();

  const { appliance, repairs, warranties } = profile;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <ApplianceIcon category={appliance.category} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-pretty sm:text-3xl">
              {appliance.name}
            </h1>
            <p className="text-muted">
              {appliance.brand} · {appliance.model} · {appliance.location}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <ButtonLink href={`/appliances/${appliance.id}/edit`} variant="secondary">
            <Pencil className="size-4" aria-hidden="true" />
            Edit details
          </ButtonLink>
          <ButtonLink href={`/appliances/${appliance.id}/passport`} variant="secondary">
            <Printer className="size-4" aria-hidden="true" />
            Print passport
          </ButtonLink>
          <ButtonLink href={`/repairs/upload?appliance=${appliance.id}`} variant="secondary">
            <Upload className="size-4" aria-hidden="true" />
            Upload repair bill
          </ButtonLink>
          <ButtonLink href={`/appliances/${appliance.id}/repairs/new`}>
            <Plus className="size-4" aria-hidden="true" />
            Log a repair
          </ButtonLink>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6">
          <ApplianceDetails appliance={appliance} />
          {/* Warranty status uses today's date, so it loads per visit. */}
          <Suspense fallback={<ApplianceWarrantiesSkeleton />}>
            <ApplianceWarranties warranties={warranties} />
          </Suspense>
          <Suspense fallback={<ApplianceWarrantiesSkeleton />}>
            <ReplacementAdvicePanel appliance={appliance} repairs={repairs} />
          </Suspense>
          <SharePanel appliance={appliance} />
        </div>
        <div className="lg:col-span-2">
          <RepairTimeline applianceId={appliance.id} repairs={repairs} />
        </div>
      </div>
    </>
  );
}

/** Placeholder for the whole profile while the appliance loads. */
function ProfileSkeleton() {
  return (
    <div className="grid motion-safe:animate-pulse gap-6" aria-hidden="true">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-lg bg-border" />
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-border" />
          <div className="h-4 w-72 max-w-full rounded bg-border" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-xl border border-border" />
        <div className="h-96 rounded-xl border border-border lg:col-span-2" />
      </div>
    </div>
  );
}
