"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/lib/auth/actions";
import { buttonClassName } from "@/components/ui/button-styles";
import { TextField } from "@/components/ui/text-field";
import { FormMessage } from "./form-message";

const initialState: AuthFormState = {};

/**
 * Client Component: it runs in the browser so it can show "Signing in…"
 * while the server checks the password (`pending` from useActionState).
 */
export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

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
      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("primary", "md", "w-full disabled:opacity-70")}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
