import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function tryUnlink(absPath: string) {
  try {
    await fs.unlink(absPath);
  } catch {
    // ignore if missing
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    // check folder thuộc user
    const root = await prisma.fileFolder.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true },
    });
    if (!root) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // BFS lấy toàn bộ folderIds trong subtree (cùng owner)
    const toVisit: string[] = [id];
    const folderIds: string[] = [];

    while (toVisit.length) {
      const fid = toVisit.pop() as string;
      folderIds.push(fid);

      const children = await prisma.fileFolder.findMany({
        where: { parentId: fid, ownerId: user.id },
        select: { id: true },
      });

      for (const c of children) toVisit.push(c.id);
    }

    const files = await prisma.storedFile.findMany({
      where: { ownerId: user.id, folderId: { in: folderIds } },
      select: { id: true, storageKey: true },
    });

    await prisma.storedFile.deleteMany({
      where: { ownerId: user.id, folderId: { in: folderIds } },
    });

    await prisma.fileFolder.delete({
      where: { id },
    });

    for (const f of files) {
      const absPath = path.join(process.cwd(), "public", "upload", "files", f.storageKey);
      await tryUnlink(absPath);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
