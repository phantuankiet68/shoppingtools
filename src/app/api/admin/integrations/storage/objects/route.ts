import { NextRequest, NextResponse } from "next/server";
import { deleteObject, listObjects, resolveSiteId } from "@/features/integrations/storage/types";

export async function GET(req: NextRequest) {
  try {
    const siteId = await resolveSiteId({
      siteId: req.nextUrl.searchParams.get("siteId"),
    });

    const query = req.nextUrl.searchParams.get("query") || "";
    const visibility = req.nextUrl.searchParams.get("visibility") || "ALL";

    const data = await listObjects(siteId, query, visibility);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get objects.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const siteId = await resolveSiteId({
      siteId: req.nextUrl.searchParams.get("siteId"),
    });

    const key = req.nextUrl.searchParams.get("key") || "";
    if (!key) {
      return NextResponse.json({ ok: false, error: "Object key is required." }, { status: 400 });
    }

    const data = await deleteObject(siteId, key);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete object.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
