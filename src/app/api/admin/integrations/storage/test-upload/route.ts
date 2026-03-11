import { NextRequest, NextResponse } from "next/server";
import { resolveSiteId, runTestUpload } from "@/features/integrations/storage/types";

export async function POST(req: NextRequest) {
  try {
    let siteId: string | null = null;

    try {
      const body = (await req.json()) as { siteId?: string };
      siteId = body.siteId || null;
    } catch {
      siteId = null;
    }

    const resolvedSiteId = await resolveSiteId({ siteId });
    const data = await runTestUpload(resolvedSiteId);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test upload failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
