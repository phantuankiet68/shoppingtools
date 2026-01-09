import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId"); // null => root

    const folders = await prisma.fileFolder.findMany({
      where: { ownerId: user.id, parentId: parentId || null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true, updatedAt: true },
    });

    const files = await prisma.storedFile.findMany({
      where: { ownerId: user.id, folderId: parentId || null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, mimeType: true, sizeBytes: true, updatedAt: true, folderId: true },
    });

    return NextResponse.json({ parentId: parentId || null, folders, files });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
