import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const file = await prisma.storedFile.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true, storageKey: true },
    });
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.storedFile.delete({ where: { id } });

    const absPath = path.join(process.cwd(), "public", "upload", "files", file.storageKey);
    try {
      await fs.unlink(absPath);
    } catch {
      // ignore if file missing
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
