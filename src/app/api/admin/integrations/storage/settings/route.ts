import { NextRequest, NextResponse } from "next/server";
import {
  getStorageSettings,
  resolveSiteId,
  updateStorageSettings,
  type StorageSettingsDto,
} from "@/features/integrations/storage/types";

export async function GET(req: NextRequest) {
  try {
    const siteId = await resolveSiteId({
      siteId: req.nextUrl.searchParams.get("siteId"),
    });

    const data = await getStorageSettings(siteId);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get storage settings.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as StorageSettingsDto & { siteId?: string };
    const siteId = await resolveSiteId({ siteId: body.siteId });

    const data = await updateStorageSettings(siteId, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update storage settings.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
