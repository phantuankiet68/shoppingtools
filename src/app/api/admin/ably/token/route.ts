import { NextResponse } from "next/server";
import Ably from "ably";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET() {
  try {
    const me = await requireAdminAuthUser();
    const client = new Ably.Rest(process.env.ABLY_API_KEY!);
    const tokenRequest = await client.auth.createTokenRequest({ clientId: me.id });
    return NextResponse.json(tokenRequest);
  } catch (e: any) {
    return NextResponse.json({ error: "Unauthorized", detail: e?.message ?? "UNAUTHORIZED" }, { status: 401 });
  }
}
