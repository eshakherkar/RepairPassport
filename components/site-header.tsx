import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button-link";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
];

/** Header for the public marketing pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {/* Section links are hidden on phones so the bar stays on one line. */}
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-block"
            >
              {link.label}
            </a>
          ))}
          {/*
            The wrapper does the hiding: ButtonLink always sets its own
            display (inline-flex), which would override a "hidden" class.
          */}
          <span className="hidden sm:ml-2 sm:inline-flex">
            <ButtonLink href="/sign-in" size="sm" variant="secondary">
              Sign in
            </ButtonLink>
          </span>
          {/* Signed-out visitors are taken to sign-in first (proxy.ts). */}
          <ButtonLink href="/dashboard" size="sm">
            Open dashboard
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
