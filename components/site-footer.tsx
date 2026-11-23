import { Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2">
          <Leaf className="size-4 text-brand" aria-hidden="true" />
          RepairPassport: helping household appliances last longer.
        </p>
        <p>Built for LaunchPad Hacks</p>
      </div>
    </footer>
  );
}
