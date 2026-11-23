"use client";

import { useActionState, useState } from "react";
import { signIn, type AuthFormState } from "@/lib/auth/actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { FormMessage } from "@/components/ui/form-message";
import { Turnstile } from "@/components/auth/turnstile";

const initialState: AuthFormState = {};

/**
 * Client Component: it runs in the browser so it can show "Signing in…"
 * while the server checks the password (`pending` from useActionState).
 */
export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [verified, setVerified] = useState(false);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {state.error ? (
        <FormMessage tone="error">{state.error}</FormMessage>
      ) : (
        notice && <FormMessage tone="success">{notice}</FormMessage>
      )}

      {/* Where to go after signing in (checked again on the server). */}
      <input type="hidden" name="next" value={next} />

      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      <Turnstile resetKey={state} onVerified={setVerified} />
      <button
        type="submit"
        disabled={pending || !verified}
        className={buttonClassName("primary", "md", "w-full disabled:opacity-70")}
      >
        {!verified ? "Checking you’re human…" : pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
