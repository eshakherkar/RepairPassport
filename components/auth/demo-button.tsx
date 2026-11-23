"use client";

import { useActionState } from "react";
import { PlayCircle } from "lucide-react";
import { startDemo, type AuthFormState } from "@/lib/auth/actions";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { Turnstile } from "@/components/auth/turnstile";

const initialState: AuthFormState = {};

/** One click: a private guest account with the sample appliances, no sign-up. */
export function DemoButton({
  variant = "primary",
  size = "md",
  label = "Try the demo, no sign-up",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(startDemo, initialState);

  return (
    <form action={formAction} className={`grid gap-2 ${className}`}>
      <Turnstile resetKey={state} />
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName(variant, size, `${size === "md" ? "h-11 px-5" : ""} disabled:opacity-70`)}
      >
        <PlayCircle className="size-4" aria-hidden="true" />
        {pending ? "Starting…" : label}
      </button>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
    </form>
  );
}
