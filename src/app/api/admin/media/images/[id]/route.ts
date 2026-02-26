import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import { unlink } from "fs/promises";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const img = await prisma.imageAsset.findFirst({
      where: { id, userId: user.id },
      select: { fileName: true },
    });

    if (!img) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.imageAsset.delete({ where: { id } });

    const filePath = path.join(process.cwd(), "public", "upload", "images", user.id, img.fileName);

    await unlink(filePath).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
