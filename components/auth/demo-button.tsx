"use client";

import { useActionState } from "react";
import { PlayCircle } from "lucide-react";
import { startDemo, type AuthFormState } from "@/lib/auth/actions";
import { buttonClassName, type ButtonVariant } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";

const initialState: AuthFormState = {};

/** One click: a private guest account with the sample appliances, no sign-up. */
export function DemoButton({
  variant = "primary",
  className = "",
}: {
  variant?: ButtonVariant;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(startDemo, initialState);

  return (
    <form action={formAction} className={`grid gap-2 ${className}`}>
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName(variant, "md", "h-11 px-5 disabled:opacity-70")}
      >
        <PlayCircle className="size-4" aria-hidden="true" />
        {pending ? "Starting the demo…" : "Try the demo, no sign-up"}
      </button>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
    </form>
  );
}
