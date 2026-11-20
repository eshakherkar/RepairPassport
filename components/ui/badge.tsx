import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral: "border-border text-muted",
  success: "border-transparent bg-brand-soft text-brand",
  warning: "border-transparent bg-warning-soft text-warning",
};

/** A small rounded label for a status, e.g. "Under warranty". */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
