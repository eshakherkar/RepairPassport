import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  /** Optional element on the right of the title, e.g. a link or total. */
  aside?: ReactNode;
  children: ReactNode;
};

/** A bordered section with a heading, used to group content on a page. */
export function Panel({ title, aside, children }: PanelProps) {
  const headingId = `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-border bg-background"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
        <h2 id={headingId} className="font-semibold">
          {title}
        </h2>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
