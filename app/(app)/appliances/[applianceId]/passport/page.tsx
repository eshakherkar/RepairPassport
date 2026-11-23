import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/appliances/print-button";
import { Logo } from "@/components/logo";
import { applianceCategoryLabels } from "@/lib/appliance-categories";
import { getApplianceById, getApplianceProfile } from "@/lib/data/appliances";
import { DEFAULT_CURRENCY, formatDate, formatMoney } from "@/lib/format";
import { getSiteOrigin } from "@/lib/site-origin";
import { getApplianceCoverage, toISODate } from "@/lib/warranty";

/*
 * /appliances/[applianceId]/passport: a one-page card to print and stick on
 * the appliance, with its key facts and (if shared) a QR code to its history.
 */

type Props = PageProps<"/appliances/[applianceId]/passport">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { applianceId } = await params;
  const appliance = await getApplianceById(applianceId);
  return { title: appliance ? `Passport · ${appliance.name}` : "Appliance not found" };
}

export default function PassportPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-96 motion-safe:animate-pulse rounded-xl border border-border" />}>
      <PassportCard params={params} />
    </Suspense>
  );
}

async function PassportCard({ params }: Pick<Props, "params">) {
  const { applianceId } = await params;
  const profile = await getApplianceProfile(applianceId);
  if (!profile) notFound();
  await connection(); // warranty status uses today's date

  const { appliance, repairs, warranties } = profile;
  const today = toISODate(new Date());
  const coverage = getApplianceCoverage(warranties, today);
  const spent = repairs.reduce((sum, r) => sum + r.cost.amount, 0);
  const shareUrl = appliance.shareToken
    ? `${await getSiteOrigin()}/share/${appliance.shareToken}`
    : null;
  const qrSvg = shareUrl ? await QRCode.toString(shareUrl, { type: "svg", margin: 1, width: 160 }) : null;

  const facts: [string, string][] = [
    ["Type", applianceCategoryLabels[appliance.category]],
    ["Brand", appliance.brand],
    ["Model", appliance.model],
    ["Serial number", appliance.serialNumber ?? "Not recorded"],
    ["Location", appliance.location],
    ["Purchased", formatDate(appliance.purchaseDate)],
    [
      "Warranty",
      coverage.kind === "none"
        ? "No active warranty"
        : `${coverage.kind === "manufacturer" ? "Manufacturer" : "Repair"} warranty until ${formatDate(coverage.expiresOn)}`,
    ],
    [
      "Repairs",
      repairs.length === 0
        ? "None recorded"
        : `${repairs.length} · last on ${formatDate(repairs[0].repairDate)} · ${formatMoney({ amount: spent, currency: DEFAULT_CURRENCY })} in total`,
    ],
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/appliances/${appliance.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {appliance.name}
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto w-full max-w-2xl rounded-2xl border-2 border-border bg-background p-6 sm:p-8 print:max-w-none print:border-black">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border pb-4">
          <Logo />
          <p className="text-sm font-medium text-muted">Maintenance passport</p>
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-pretty sm:text-3xl">
          {appliance.name}
        </h1>

        <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] print:grid-cols-[1fr_auto]">
          <dl className="grid gap-2.5 text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[7.5rem_1fr] gap-2">
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="grid justify-items-center content-start gap-2 text-center">
            {qrSvg ? (
              <>
                <div
                  className="rounded-lg bg-white p-2"
                  role="img"
                  aria-label={`QR code for the shared history of ${appliance.name}`}
                  // qrcode returns a plain SVG string built from our own URL.
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="max-w-40 text-xs text-muted">Scan for the full repair history</p>
              </>
            ) : (
              <p className="max-w-48 rounded-lg border border-dashed border-border p-4 text-xs text-muted print:hidden">
                To add a QR code, use <strong>Create share link</strong> on the appliance page.
              </p>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
