import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignUpPage() {
  return (
    <>
      <AuthHeading
        title="Create your account"
        description="Keep every household appliance's repairs, bills and warranties in one place."
      />
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-brand hover:text-brand-hover">
          Sign in
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
