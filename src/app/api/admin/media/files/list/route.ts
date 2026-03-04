import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId"); // null => root

    const folders = await prisma.folder.findMany({
      where: { userId: user.id, parentId: parentId ?? null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true, updatedAt: true },
    });

    const files = await prisma.file.findMany({
      where: { userId: user.id, folderId: parentId ?? null },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        fileName: true,
        mimeType: true,
        size: true,
        updatedAt: true,
        folderId: true,
      },
    });

    return NextResponse.json({ parentId: parentId ?? null, folders, files });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
