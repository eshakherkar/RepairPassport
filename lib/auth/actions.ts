"use server";

/**
 * Server Actions for signing up, in and out.
 * "use server" means these functions only ever run on the server, even
 * though the forms in the browser call them. Passwords never touch our
 * database: Supabase Auth stores them, hashed.
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "./routes";
import { validateEmail, validateNewPassword } from "./validation";

export type AuthFormState = {
  /** A message about the whole form, e.g. "Email or password is incorrect." */
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  /** Sent back so the email field keeps its value. Passwords never are. */
  email?: string;
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
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Where the link in the confirmation email leads.
      emailRedirectTo: `${await getOrigin()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    switch (error.code) {
      case "weak_password":
        return { email, fieldErrors: { password: "Choose a stronger password." } };
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

  // With email confirmation on, Supabase also "succeeds" for addresses that
  // already have an account (so nobody can probe which emails are registered).
  // Either way, the next step is the same: check your email.
  redirect("/check-email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in?signed-out=1");
}

/** This site's address, e.g. http://localhost:3000, from the request. */
async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
