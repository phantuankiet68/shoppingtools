import { NextRequest, NextResponse } from "next/server";
import { listLogs, resolveSiteId } from "@/features/integrations/storage/types";

export async function GET(req: NextRequest) {
  try {
    const siteId = await resolveSiteId({
      siteId: req.nextUrl.searchParams.get("siteId"),
    });

    const data = await listLogs(siteId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get logs.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
