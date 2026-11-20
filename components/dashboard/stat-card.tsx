import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  /** A short line under the number, e.g. "1 expiring within 30 days". */
  detail?: ReactNode;
};

/**
 * One overview number on the dashboard.
 * Rendered as a <div> inside a <dl> (description list): screen readers
 * announce each label together with its value.
 */
export function StatCard({ icon: Icon, label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <dt className="flex items-center gap-3 text-sm font-medium text-muted">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {label}
      </dt>
      <dd className="mt-4">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {detail && <div className="mt-1 text-sm text-muted">{detail}</div>}
      </dd>
    </div>
  );
}

/** Grey placeholder shown while the real numbers load. */
export function StatCardSkeleton() {
  return (
    <div
      className="motion-safe:animate-pulse rounded-xl border border-border bg-background p-5"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-border" />
        <div className="h-4 w-28 rounded bg-border" />
      </div>
      <div className="mt-4 h-8 w-12 rounded bg-border" />
      <div className="mt-2 h-4 w-40 max-w-full rounded bg-border" />
    </div>
  );
}
