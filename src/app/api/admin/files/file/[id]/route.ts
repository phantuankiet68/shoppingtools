import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const params = "then" in (ctx.params as any) ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
    const id = params.id;

    const file = await prisma.storedFile.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true, storageKey: true },
    });
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.storedFile.delete({ where: { id } });

    const absPath = path.join(process.cwd(), "public", "upload", "files", file.storageKey);
    try {
      await fs.unlink(absPath);
    } catch {}

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
