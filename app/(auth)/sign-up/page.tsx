import type { Metadata } from "next";
import Link from "next/link";
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
    </>
  );
}
