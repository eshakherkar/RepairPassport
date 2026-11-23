import QRCode from "qrcode";
import { QrCode } from "lucide-react";
import { buttonClassName } from "@/components/ui/button-styles";
import { Panel } from "@/components/ui/panel";
import { setSharing } from "@/lib/data/share-actions";
import { getSiteOrigin } from "@/lib/site-origin";
import type { Appliance } from "@/lib/types";
import { CopyLinkButton } from "./copy-link-button";

/**
 * Share an appliance's repair history with a technician, landlord or buyer:
 * a read-only page at /share/<token>, plus a QR code to print or show.
 */
export async function SharePanel({ appliance }: { appliance: Appliance }) {
  if (!appliance.shareToken) {
    return (
      <Panel title="Share history">
        <p className="text-sm text-pretty text-muted">
          Create a read-only link and QR code for this appliance&apos;s repair history, for a
          technician, tenant or buyer. It opens with a quick condition summary. Anyone with the
          link can view it without signing in, and you can stop sharing at any time.
        </p>
        <form action={setSharing.bind(null, appliance.id, true)} className="mt-4">
          <button type="submit" className={buttonClassName("secondary")}>
            <QrCode className="size-4" aria-hidden="true" />
            Create share link
          </button>
        </form>
      </Panel>
    );
  }

  const url = `${await getSiteOrigin()}/share/${appliance.shareToken}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 1, width: 192 });

  return (
    <Panel title="Share history">
      <div className="grid justify-items-start gap-4">
        <div
          className="rounded-lg bg-white p-2"
          role="img"
          aria-label={`QR code for the shared history of ${appliance.name}`}
          // qrcode returns a plain SVG string built from our own URL.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="text-sm text-muted">
          Scan it, or send the link. It shows the details, warranties and repairs, but not the
          serial number or bills.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium break-all text-brand hover:text-brand-hover"
        >
          {url}
        </a>
        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={url} />
          <form action={setSharing.bind(null, appliance.id, false)}>
            <button type="submit" className={buttonClassName("secondary", "sm")}>
              Stop sharing
            </button>
          </form>
        </div>
      </div>
    </Panel>
  );
}
