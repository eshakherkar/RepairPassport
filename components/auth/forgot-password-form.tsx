"use client";

import { useActionState, useState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/lib/auth/actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import { Turnstile } from "@/components/auth/turnstile";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const [verified, setVerified] = useState(false);

  if (state.sent) {
    return (
      <FormMessage tone="success">
        If {state.email} has an account, a reset link is on its way. Open it on this device, in
        this browser, to choose a new password. Check your spam folder too.
      </FormMessage>
    );
  }

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
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
      <Turnstile resetKey={state} onVerified={setVerified} />
      <button
        type="submit"
        disabled={pending || !verified}
        className={buttonClassName("primary", "md", "w-full disabled:opacity-70")}
      >
        {!verified ? "Checking you’re human…" : pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}
