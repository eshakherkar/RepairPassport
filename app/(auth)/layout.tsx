import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * Layout for sign-in, sign-up and related pages: a centred card.
 * "(auth)" is a route group, so it doesn't appear in URLs: /sign-in, /sign-up.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 items-center justify-center bg-surface px-4 py-12 outline-none"
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted transition-colors hover:text-foreground">
            ← Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
