import { CircleUserRound, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";

/**
 * Shows who is signed in, with a Sign out button.
 * "sidebar": full version for the desktop sidebar.
 * "compact": icon button for the phone/tablet top bar.
 *
 * It reads the session (cookies), so the layout wraps it in <Suspense>.
 * If nobody is signed in it redirects to sign-in, a second line of
 * defence behind proxy.ts.
 *
 * Sign out is a plain <form> calling a Server Action, so it works even
 * before the page's JavaScript has loaded.
 */
export async function UserMenu({ variant }: { variant: "sidebar" | "compact" }) {
  const user = await requireUser();

  if (variant === "compact") {
    return (
      <form action={signOut}>
        <button
          type="submit"
          className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Sign out</span>
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-1 border-t border-border pt-4">
      <div className="flex items-center gap-2 px-3 py-1 text-sm">
        <CircleUserRound className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <span className="min-w-0">
          <span className="sr-only">Signed in as </span>
          <span className="block truncate font-medium" title={user.email ?? undefined}>
            {user.email ?? "Signed in"}
          </span>
        </span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );
}

/** Placeholder while the user is being looked up. */
export function UserMenuSkeleton({ variant }: { variant: "sidebar" | "compact" }) {
  if (variant === "compact") {
    return <div className="h-9 w-9 rounded-lg bg-border motion-safe:animate-pulse sm:w-24" aria-hidden="true" />;
  }
  return (
    <div className="grid gap-2 border-t border-border pt-4 motion-safe:animate-pulse" aria-hidden="true">
      <div className="mx-3 h-4 w-40 rounded bg-border" />
      <div className="mx-3 h-8 rounded bg-border" />
    </div>
  );
}
