import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Check your email",
};

/** Shown after signing up, while the confirmation email is on its way. */
export default function CheckEmailPage() {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <MailCheck className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-2 text-sm text-pretty text-muted">
        We&apos;ve sent you a confirmation link. Open it to activate your
        account and you&apos;ll be signed in.
      </p>
      <ul className="mt-6 grid gap-2 rounded-lg bg-surface p-4 text-left text-sm text-muted">
        <li>You can open the link on any device, such as your phone.</li>
        <li>It can take a few minutes to arrive. Check your spam folder too.</li>
        <li>
          <strong className="text-foreground">Already have an account with this email?</strong> No new
          email is sent. Sign in instead.
        </li>
        <li>The link works once and expires after a while.</li>
      </ul>
      <p className="mt-6 text-sm text-muted">
        Already confirmed?{" "}
        <Link href="/sign-in" className="font-medium text-brand hover:text-brand-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
