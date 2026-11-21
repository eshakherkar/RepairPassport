import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
};

/** Opened from the reset email's link, which has already signed the user in. */
export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading
        title="Choose a new password"
        description="You'll use it the next time you sign in."
      />
      <ResetPasswordForm />
    </>
  );
}
