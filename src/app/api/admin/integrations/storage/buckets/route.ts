import { NextRequest, NextResponse } from "next/server";
import { createBucket, listBuckets, resolveSiteId } from "@/features/integrations/storage/types";
export async function GET(req: NextRequest) {
  try {
    const siteId = await resolveSiteId({
      siteId: req.nextUrl.searchParams.get("siteId"),
    });

    const data = await listBuckets(siteId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get buckets.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string; siteId?: string };
    const siteId = await resolveSiteId({ siteId: body.siteId });

    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "Bucket name is required." }, { status: 400 });
    }

    const data = await createBucket(siteId, name);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create bucket.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
