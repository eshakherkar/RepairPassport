"use client";

import { useActionState, useState } from "react";
import { signUp, type AuthFormState } from "@/lib/auth/actions";
import { PASSWORD_MIN_LENGTH, PASSWORD_RULES } from "@/lib/auth/validation";
import { buttonClassName } from "@/components/ui/button-styles";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { FormMessage } from "@/components/ui/form-message";
import { Turnstile } from "@/components/auth/turnstile";

const initialState: AuthFormState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [verified, setVerified] = useState(false);

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
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        error={state.fieldErrors?.password}
        hint={
          <ul className="list-inside list-disc">
            {PASSWORD_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        }
      />

      <Turnstile resetKey={state} onVerified={setVerified} />
      <button
        type="submit"
        disabled={pending || !verified}
        className={buttonClassName("primary", "md", "w-full disabled:opacity-70")}
      >
        {!verified ? "Checking you’re human…" : pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
