import type { Metadata } from "next";
import { LinkIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Link didn't work",
};

/** Shown when a confirmation link is invalid, expired or already used. */
export default function AuthErrorPage() {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning-soft text-warning">
        <LinkIcon className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">That link didn&apos;t work</h1>
      <p className="mt-2 text-sm text-pretty text-muted">
        It may have expired or already been used. If you already confirmed
        your email, just sign in.
      </p>
      <div className="mt-6 grid gap-2">
        <ButtonLink href="/sign-in">Try signing in</ButtonLink>
        <ButtonLink href="/sign-up" variant="secondary">
          Sign up again
        </ButtonLink>
      </div>
    </div>
  );
}
