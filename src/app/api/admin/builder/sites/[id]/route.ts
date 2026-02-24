import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } | { params: Promise<{ id: string }> },
) {
  try {
    const params = "then" in (ctx as any).params ? await (ctx as any).params : (ctx as any).params;
    const id = params?.id;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.site.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // domain unique / not found / etc
    return NextResponse.json({ error: e?.message || "Delete failed" }, { status: 400 });
  }
}
