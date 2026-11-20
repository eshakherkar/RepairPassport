import { connection } from "next/server";
import { ClipboardList, Refrigerator, ShieldCheck, TriangleAlert } from "lucide-react";
import { getDashboardStats } from "@/lib/data/appliances";
import { EXPIRING_SOON_DAYS, toISODate } from "@/lib/warranty";
import { StatCard, StatCardSkeleton } from "./stat-card";

/**
 * The three overview numbers at the top of the dashboard.
 *
 * Warranty status depends on today's date, so this must run when someone
 * visits the page, not once at build time. `await connection()` tells
 * Next.js to wait for a real request before continuing. The page wraps
 * this component in <Suspense> so the rest of it can still be pre-built.
 */
export async function OverviewStats() {
  await connection();
  const today = toISODate(new Date());
  const stats = await getDashboardStats(today);

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={Refrigerator}
        label="Appliances"
        value={stats.applianceCount}
        detail="With a maintenance passport"
      />
      <StatCard
        icon={ClipboardList}
        label="Repair records"
        value={stats.repairCount}
        detail="Repairs and services logged"
      />
      <StatCard
        icon={ShieldCheck}
        label="Active warranties"
        value={stats.activeWarrantyCount}
        detail={
          stats.expiringSoonCount > 0 ? (
            <span className="flex items-center gap-1.5 font-medium text-warning">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {stats.expiringSoonCount} expiring within {EXPIRING_SOON_DAYS}{" "}
              days
            </span>
          ) : (
            `None expiring in the next ${EXPIRING_SOON_DAYS} days`
          )
        }
      />
    </dl>
  );
}

/** Shown in place of <OverviewStats> while it loads. */
export function OverviewStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}
