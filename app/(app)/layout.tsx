import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/app-shell/app-nav";
import { AppNavList } from "@/components/app-shell/app-nav-list";
import { SampleDataNotice } from "@/components/app-shell/sample-data-notice";
import { UserMenu, UserMenuSkeleton } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";

/**
 * Layout for the signed-in app: the dashboard, appliances and repairs.
 * Signed-out visitors are sent to /sign-in by proxy.ts, and UserMenu
 * checks again on the server.
 * The "(app)" folder is a route group, so it doesn't appear in URLs:
 * app/(app)/dashboard/page.tsx is served at /dashboard.
 *
 * Desktop (lg and up): fixed sidebar on the left.
 * Phones and tablets: top bar with the logo and a row of tabs.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo href="/dashboard" />
        </div>
        <nav aria-label="App" className="mt-8 flex-1">
          {/* While the URL isn't known yet, show the links without a highlight. */}
          <Suspense fallback={<AppNavList variant="sidebar" pathname={null} />}>
            <AppNav variant="sidebar" />
          </Suspense>
        </nav>
        <Link
          href="/"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to website
        </Link>
        {/* Who's signed in: read from the session per visit. */}
        <Suspense fallback={<UserMenuSkeleton variant="sidebar" />}>
          <UserMenu variant="sidebar" />
        </Suspense>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phone and tablet top bar */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <Logo href="/dashboard" />
            <Suspense fallback={<UserMenuSkeleton variant="compact" />}>
              <UserMenu variant="compact" />
            </Suspense>
          </div>
          <nav aria-label="App" className="px-2 pb-2 sm:px-4">
            <Suspense fallback={<AppNavList variant="tabs" pathname={null} />}>
              <AppNav variant="tabs" />
            </Suspense>
          </nav>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <SampleDataNotice />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
