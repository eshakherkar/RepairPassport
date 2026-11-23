"use client";

import type { ReactNode } from "react";
import { signOut } from "@/lib/auth/actions";

/**
 * The Sign out form. Demo guests have no email or password, so signing out
 * loses their demo for good: ask first.
 */
export function SignOutForm({ guest, children }: { guest: boolean; children: ReactNode }) {
  return (
    <form
      action={signOut}
      onSubmit={(event) => {
        if (
          guest &&
          !window.confirm(
            "Leave the demo? Guest accounts can't be signed back into, so this demo's data will be lost. You can start a fresh demo any time.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
