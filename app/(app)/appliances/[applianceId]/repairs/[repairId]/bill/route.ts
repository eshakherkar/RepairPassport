import { NextResponse, type NextRequest } from "next/server";
import { isRecordId } from "@/lib/appliance-validation";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /appliances/<id>/repairs/<repairId>/bill: opens the repair's uploaded
 * bill. Row Level Security means only the owner finds the repair, and the
 * file is served through a link that expires after a minute.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/appliances/[applianceId]/repairs/[repairId]/bill">,
) {
  const { applianceId, repairId } = await params;
  if (!isRecordId(applianceId) || !isRecordId(repairId)) {
    return new NextResponse("Bill not found", { status: 404 });
  }

  const supabase = await createClient();
  const { data: repair } = await supabase
    .from("repairs")
    .select("bill_path")
    .eq("id", repairId)
    .eq("appliance_id", applianceId)
    .maybeSingle();
  if (!repair?.bill_path) return new NextResponse("Bill not found", { status: 404 });

  const { data } = await supabase.storage.from("bills").createSignedUrl(repair.bill_path, 60);
  if (!data) return new NextResponse("Bill not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
