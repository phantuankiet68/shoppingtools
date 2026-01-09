import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function normName(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const current = await prisma.imageFolder.findFirst({
      where: { id, userId: user.id },
      select: { id: true, parentId: true },
    });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const name = normName(String(body?.name ?? ""));
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (name.length > 80) return NextResponse.json({ error: "Name is too long (max 80)" }, { status: 400 });

    const updated = await prisma.imageFolder.update({
      where: { id },
      data: { name },
      select: { id: true, name: true, parentId: true, updatedAt: true },
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Folder name already exists in this location" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") ?? "restrict") as "restrict" | "detach";

    const current = await prisma.imageFolder.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // check children folders
    const childCount = await prisma.imageFolder.count({ where: { userId: user.id, parentId: id } });
    if (childCount > 0) {
      return NextResponse.json({ error: "Folder has subfolders. Delete/move subfolders first." }, { status: 409 });
    }

    // images in folder
    const imgCount = await prisma.imageAsset.count({ where: { userId: user.id, folderId: id } });

    if (mode === "restrict") {
      if (imgCount > 0) {
        return NextResponse.json({ error: "Folder is not empty. Move/delete images first." }, { status: 409 });
      }
      await prisma.imageFolder.delete({ where: { id } });
      return NextResponse.json({ ok: true, mode, detached: 0 });
    }

    // mode=detach
    const result = await prisma.$transaction(async (tx) => {
      let detached = 0;

      if (imgCount > 0) {
        const r = await tx.imageAsset.updateMany({
          where: { userId: user.id, folderId: id },
          data: { folderId: null },
        });
        detached = r.count;
      }

      await tx.imageFolder.delete({ where: { id } });

      return { detached };
    });

    return NextResponse.json({ ok: true, mode, detached: result.detached });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
