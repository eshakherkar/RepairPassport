"use server";

/**
 * Server Actions for signing up, in and out.
 * "use server" means these functions only ever run on the server, even
 * though the forms in the browser call them. Passwords never touch our
 * database: Supabase Auth stores them, hashed.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { copySampleData } from "@/lib/data/copy-sample-data";
import { getSiteOrigin } from "@/lib/site-origin";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./session";
import { safeNextPath } from "./routes";
import { validateEmail, validateNewPassword } from "./validation";

export type AuthFormState = {
  /** A message about the whole form, e.g. "Email or password is incorrect." */
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  /** Sent back so the email field keeps its value. Passwords never are. */
  email?: string;
  /** True once a password-reset email has been requested. */
  sent?: boolean;
};

export async function signIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  if (!password) fieldErrors.password = "Enter your password.";
  if (fieldErrors.email || fieldErrors.password) return { email, fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    switch (error.code) {
      case "email_not_confirmed":
        return {
          email,
          error:
            "Please confirm your email first. Open the link we emailed you, then sign in.",
        };
      case "over_request_rate_limit":
        return { email, error: "Too many attempts. Please wait a minute and try again." };
      default:
        // Deliberately vague: don't reveal whether the email has an account.
        return { email, error: "Email or password is incorrect." };
    }
  }

  revalidatePath("/", "layout");
  redirect(next); // Must be outside any try/catch: redirect() works by throwing.
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  const passwordError = validateNewPassword(password);
  if (passwordError) fieldErrors.password = passwordError;
  if (fieldErrors.email || fieldErrors.password) return { email, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Where the link in the confirmation email leads.
      emailRedirectTo: `${await getSiteOrigin()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    switch (error.code) {
      case "weak_password":
        return { email, fieldErrors: { password: "Choose a stronger password." } };
      case "user_already_exists":
        return {
          email,
          fieldErrors: { email: "This email already has an account. Sign in instead." },
        };
      case "email_address_invalid":
        return { email, fieldErrors: { email: "That email address can't be used." } };
      case "over_email_send_rate_limit":
        return {
          email,
          error:
            "Too many sign-up emails were sent recently. Please wait a while and try again.",
        };
      case "signup_disabled":
        return { email, error: "New sign-ups are switched off right now." };
      default:
        return { email, error: "Couldn't create your account. Please try again." };
    }
  }

  // "Confirm email" is off in Supabase, so sign-up signs the user straight in.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // If "Confirm email" is switched back on, the next step is the email link.
  redirect("/check-email");
}

/**
 * Emails a password-reset link. Always reports success, so nobody can use
 * this form to find out which emails have accounts.
 */
export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const emailError = validateEmail(email);
  if (emailError) return { email, fieldErrors: { email: emailError } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getSiteOrigin()}/auth/confirm?next=/reset-password`,
  });
  if (error?.code === "over_email_send_rate_limit") {
    return { email, error: "Too many emails were sent recently. Please wait a while and try again." };
  }
  return { email, sent: true };
}

/** Sets a new password for the user signed in by the reset link. */
export async function updatePassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  await requireUser();
  const password = String(formData.get("password") ?? "");
  const passwordError = validateNewPassword(password);
  if (passwordError) return { fieldErrors: { password: passwordError } };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    switch (error.code) {
      case "same_password":
        return { fieldErrors: { password: "Choose a password different from your old one." } };
      case "weak_password":
        return { fieldErrors: { password: "Choose a stronger password." } };
      default:
        return { error: "Couldn’t change your password. Please try again." };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * "Try the demo": signs the visitor in as a private guest (a Supabase
 * anonymous user, no email or password) and fills the account with the
 * fictional sample appliances. Row Level Security keeps each guest's data
 * separate, so judges can't see or change each other's demos.
 */
export async function startDemo(): Promise<AuthFormState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    return {
      error:
        error.code === "over_request_rate_limit"
          ? "Too many demos were started recently. Please try again in a few minutes."
          : "Couldn't start the demo. Please try again.",
    };
  }

  // Same client, now signed in as the guest, so the rows belong to them.
  const sampleError = await copySampleData(supabase);
  if (sampleError) return { error: sampleError };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in?signed-out=1");
}
