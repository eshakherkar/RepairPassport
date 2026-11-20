import Link from "next/link";
import { Wrench } from "lucide-react";

/** The RepairPassport wordmark, used in the marketing header and the app shell. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-background">
        <Wrench className="size-4" aria-hidden="true" />
      </span>
      RepairPassport
    </Link>
  );
}
