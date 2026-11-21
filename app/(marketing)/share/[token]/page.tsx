import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Eye } from "lucide-react";
import { ApplianceDetails } from "@/components/appliances/appliance-details";
import { ApplianceIcon } from "@/components/appliances/appliance-icon";
import {
  ApplianceWarranties,
  ApplianceWarrantiesSkeleton,
} from "@/components/appliances/appliance-warranties";
import { RepairTimeline } from "@/components/appliances/repair-timeline";
import { getSharedProfile } from "@/lib/data/shared";

/*
 * /share/[token]: the read-only repair history an owner shared by link or
 * QR code. No sign-in needed; nothing here can be changed.
 */

export const metadata: Metadata = {
  title: "Shared repair history",
  // Private to whoever has the link: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function SharedAppliancePage({ params }: PageProps<"/share/[token]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="h-96 motion-safe:animate-pulse rounded-xl border border-border" />}>
        <SharedContent params={params} />
      </Suspense>
    </div>
  );
}

async function SharedContent({ params }: Pick<PageProps<"/share/[token]">, "params">) {
  const { token } = await params;
  const profile = await getSharedProfile(token);
  if (!profile) notFound();

  const { appliance, repairs, warranties } = profile;

  return (
    <>
      <p className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
        <Eye className="size-4" aria-hidden="true" />
        Shared maintenance passport · read-only
      </p>
      <div className="flex min-w-0 items-center gap-4">
        <ApplianceIcon category={appliance.category} />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-pretty sm:text-3xl">
            {appliance.name}
          </h1>
          <p className="text-muted">
            {appliance.brand} · {appliance.model}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6">
          <ApplianceDetails appliance={appliance} />
          <Suspense fallback={<ApplianceWarrantiesSkeleton />}>
            <ApplianceWarranties warranties={warranties} />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <RepairTimeline applianceId={appliance.id} repairs={repairs} readOnly />
        </div>
      </div>
    </>
  );
}
