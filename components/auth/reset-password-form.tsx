"use client";

import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "@/lib/auth/actions";
import { PASSWORD_MIN_LENGTH, PASSWORD_RULES } from "@/lib/auth/validation";
import { buttonClassName } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { PasswordField } from "@/components/ui/password-field";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <PasswordField
        id="password"
        name="password"
        label="New password"
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
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName("primary", "md", "w-full disabled:opacity-70")}
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
