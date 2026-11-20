import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Layout for the public marketing pages (currently the landing page at /).
 * The "(marketing)" folder is a route group: the brackets keep it out of
 * the URL, so app/(marketing)/page.tsx is still served at "/".
 * The dashboard will get its own layout in a separate "(app)" group.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
