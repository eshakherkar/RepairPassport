import Link from "next/link";
import { Wrench } from "lucide-react";

// `hideOnMobile` keeps the bar on one line on narrow phone screens.
const navLinks = [
  { href: "#features", label: "Features", hideOnMobile: true },
  { href: "#how-it-works", label: "How it works", hideOnMobile: false },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-background">
            <Wrench className="size-4" aria-hidden="true" />
          </span>
          RepairPassport
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`${link.hideOnMobile ? "hidden sm:inline-block" : "inline-block"} whitespace-nowrap rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:px-3`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
