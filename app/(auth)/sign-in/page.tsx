import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Suspense } from "react";
import { AuthFormSkeleton, AuthHeading } from "@/components/auth/auth-heading";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <>
      <AuthHeading
        title="Sign in"
        description="Welcome back. Sign in to see your appliances and repair history."
      />
      {/* Reading the URL (?next=…) happens per visit, so it sits in Suspense. */}
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignInFormFromUrl searchParams={searchParams} />
      </Suspense>
      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="font-medium text-brand hover:text-brand-hover">
          Forgot password?
        </Link>
      </p>
      <p className="mt-6 text-center text-sm text-muted">
        New to RepairPassport?{" "}
        <Link href="/sign-up" className="font-medium text-brand hover:text-brand-hover">
          Create an account
        </Link>
      </p>
      <div className="mt-8 grid gap-3 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted">Just looking? Explore with sample appliances.</p>
        <ButtonLink href="/#try-demo" variant="secondary">
          Try the demo, no sign-up
        </ButtonLink>
      </div>
    </>
  );
}

async function SignInFormFromUrl({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
  const params = await searchParams;
  return (
    <SignInForm
      next={safeNextPath(params.next)}
      notice={params["signed-out"] === "1" ? "You've been signed out." : undefined}
    />
  );
}
