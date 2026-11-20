"use client";

import { usePathname } from "next/navigation";
import { AppNavList } from "./app-nav-list";

/**
 * Client component: it runs in the browser so it can read the current URL
 * (`usePathname`) and highlight the active link.
 *
 * Next.js 16 requires components that read the URL to sit inside a
 * <Suspense> boundary (see app/(app)/layout.tsx), otherwise pages with
 * dynamic addresses like /appliances/[id] can't be prerendered.
 */
export function AppNav({ variant }: { variant: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  return <AppNavList variant={variant} pathname={pathname} />;
}
