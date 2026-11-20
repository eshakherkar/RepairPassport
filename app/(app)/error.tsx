"use client"; // Error pages must be Client Components (they use `retry`).

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Shown if something goes wrong while loading a dashboard page.
 * The app's sidebar and navigation stay visible, because this replaces
 * only the page content inside app/(app)/layout.tsx.
 *
 * Visitors never see technical details: Next.js replaces server error
 * messages with a generic one and a reference code (`digest`).
 */
export default function AppError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    // Later this could go to an error-reporting service.
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error
      ? String((error as Error & { digest?: string }).digest ?? "")
      : "";

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description={`This page couldn't be loaded. Please try again.${
        digest ? ` (Reference: ${digest})` : ""
      }`}
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className={buttonClassName("primary")}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <ButtonLink href="/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        </div>
      }
    />
  );
}
