import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

async function tryUnlink(absPath: string) {
  try {
    await fs.unlink(absPath);
  } catch {}
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const params = "then" in (ctx.params as any) ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
    const id = params.id;

    // check folder thuộc user
    const root = await prisma.fileFolder.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true },
    });
    if (!root) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // BFS lấy toàn bộ folderIds trong subtree (cùng owner)
    const toVisit = [id];
    const folderIds: string[] = [];

    while (toVisit.length) {
      const fid = toVisit.pop()!;
      folderIds.push(fid);

      const children = await prisma.fileFolder.findMany({
        where: { parentId: fid, ownerId: user.id },
        select: { id: true },
      });

      for (const c of children) toVisit.push(c.id);
    }

    // lấy các file để xóa vật lý
    const files = await prisma.storedFile.findMany({
      where: { ownerId: user.id, folderId: { in: folderIds } },
      select: { id: true, storageKey: true },
    });

    // xóa DB files trước
    await prisma.storedFile.deleteMany({
      where: { ownerId: user.id, folderId: { in: folderIds } },
    });

    // xóa DB folder (cascade children nhờ relation FolderTree onDelete: Cascade)
    await prisma.fileFolder.delete({
      where: { id },
    });

    // xóa file vật lý trong public/upload/files
    for (const f of files) {
      const absPath = path.join(process.cwd(), "public", "upload", "files", f.storageKey);
      await tryUnlink(absPath);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
