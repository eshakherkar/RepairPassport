import Link from "next/link";
import { LayoutDashboard, Refrigerator, Upload } from "lucide-react";

export const appNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/appliances", label: "Appliances", icon: Refrigerator },
  { href: "/repairs/upload", label: "Upload bill", icon: Upload },
] as const;

type AppNavListProps = {
  /** "sidebar": vertical list (desktop). "tabs": horizontal row (phones). */
  variant: "sidebar" | "tabs";
  /** The current page's path, or null while it isn't known yet. */
  pathname: string | null;
};

/** True for the item's own page and any page inside it. */
function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The app's main navigation links. This component only draws the links;
 * `AppNav` works out which page is active and passes it in.
 */
export function AppNavList({ variant, pathname }: AppNavListProps) {
  const isSidebar = variant === "sidebar";

  return (
    <ul className={isSidebar ? "flex flex-col gap-1" : "flex gap-1"}>
      {appNavItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href, pathname);
        return (
          <li key={href} className={isSidebar ? undefined : "flex-1"}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                isSidebar
                  ? "px-3 py-2"
                  : "justify-center whitespace-nowrap px-2 py-2",
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-background hover:text-foreground",
              ].join(" ")}
            >
              <Icon
                className={isSidebar ? "size-4" : "hidden size-4 sm:block"}
                aria-hidden="true"
              />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
