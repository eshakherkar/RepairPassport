import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to choose a new one."
      />
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-brand hover:text-brand-hover">
          Sign in
        </Link>
      </p>
    </>
  );
}
