import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const params = "then" in (ctx.params as any) ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
    const id = params.id;

    const file = await prisma.storedFile.findFirst({
      where: { id, ownerId: user.id },
      select: { storageKey: true },
    });

    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = new URL(`/upload/files/${file.storageKey}`, req.url);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
