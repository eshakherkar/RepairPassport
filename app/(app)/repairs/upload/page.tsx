import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Upload repair bill",
};

export default function UploadRepairBillPage() {
  return (
    <>
      <PageHeader
        title="Upload a repair bill"
        description="Add a repair bill or invoice to an appliance's history."
      />

      {/* A later milestone adds file upload and AI extraction here. */}
      <EmptyState
        icon={Receipt}
        title="Bill upload is coming soon"
        description="You'll upload a bill, AI will extract the repair date, issue, cost, replaced parts and warranty details, and you'll review them before they're saved."
        action={
          <ButtonLink href="/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    </>
  );
}
