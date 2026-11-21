"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/lib/auth/actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.sent) {
    return (
      <FormMessage tone="success">
        If {state.email} has an account, a reset link is on its way. Open it on any device to
        choose a new password. Check your spam folder too.
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
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("primary", "md", "w-full disabled:opacity-70")}
      >
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}
